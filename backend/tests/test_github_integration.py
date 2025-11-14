"""
Test suite for GitHub repository integration with arXiv ingestion pipeline.

This demonstrates:
1. Ingesting an arXiv PDF
2. Ingesting GitHub repository files
3. Verifying data in Chroma DB
"""

import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from app.services.github_service import (
    GitHubService,
    RepoFile,
    normalize_github_url,
    _extract_owner_repo,
    _infer_file_type,
)
from app.services.gemini_service import ingest_repo_files_into_chroma
from app.services.chroma_service import ChromaService


class TestGitHubServiceIntegration:
    """Integration tests for GitHub service."""

    def test_normalize_github_url_https(self):
        """Test normalization of standard HTTPS GitHub URLs."""
        url = "https://github.com/owner/repo"
        assert normalize_github_url(url) == "https://github.com/owner/repo"

    def test_normalize_github_url_https_with_git_suffix(self):
        """Test normalization of HTTPS URL with .git suffix."""
        url = "https://github.com/owner/repo.git"
        assert normalize_github_url(url) == "https://github.com/owner/repo"

    def test_normalize_github_url_ssh(self):
        """Test normalization of SSH GitHub URLs."""
        url = "git@github.com:owner/repo.git"
        assert normalize_github_url(url) == "https://github.com/owner/repo"

    def test_normalize_github_url_with_trailing_slash(self):
        """Test normalization with trailing slash."""
        url = "https://github.com/owner/repo/"
        assert normalize_github_url(url) == "https://github.com/owner/repo"

    def test_extract_owner_repo(self):
        """Test extracting owner and repo from normalized URL."""
        url = "https://github.com/myowner/myrepo"
        owner, repo = _extract_owner_repo(url)
        assert owner == "myowner"
        assert repo == "myrepo"

    def test_extract_owner_repo_invalid_url(self):
        """Test error handling for invalid GitHub URLs."""
        with pytest.raises(ValueError):
            _extract_owner_repo("https://github.com/invalid")

    def test_infer_file_type_readme(self):
        """Test file type inference for README files."""
        language, kind = _infer_file_type("README.md")
        assert language == "markdown"
        assert kind == "readme"

    def test_infer_file_type_docs(self):
        """Test file type inference for docs folder."""
        language, kind = _infer_file_type("docs/guide.md")
        assert language == "markdown"
        assert kind == "docs"

    def test_infer_file_type_python_code(self):
        """Test file type inference for Python files."""
        language, kind = _infer_file_type("src/main.py")
        assert language == "python"
        assert kind == "code"

    def test_infer_file_type_notebook(self):
        """Test file type inference for Jupyter notebooks."""
        language, kind = _infer_file_type("examples/tutorial.ipynb")
        assert language == "python"
        assert kind == "notebook"

    def test_repo_file_creation(self):
        """Test RepoFile dataclass creation and language inference."""
        content = "print('hello')"
        repo_file = RepoFile.from_path("src/hello.py", content)
        assert repo_file.path == "src/hello.py"
        assert repo_file.content == content
        assert repo_file.language == "python"
        assert repo_file.kind == "code"

    @pytest.mark.asyncio
    async def test_fetch_repo_files_invalid_url(self):
        """Test error handling for invalid GitHub URLs."""
        service = GitHubService()
        result = await service.fetch_repo_files("not-a-github-url")
        assert result == []

    @pytest.mark.asyncio
    async def test_fetch_repo_files_mock(self):
        """Test repo file fetching with mocked HTTP responses."""
        service = GitHubService()

        # Mock the HTTP client
        with patch("app.services.github_service.httpx.AsyncClient") as mock_client_cls:
            mock_client = AsyncMock()
            mock_client_cls.return_value.__aenter__.return_value = mock_client

            # Mock API response for default branch
            repo_info_response = MagicMock()
            repo_info_response.status_code = 200
            repo_info_response.json.return_value = {"default_branch": "main"}

            # Mock API response for tree listing
            tree_response = MagicMock()
            tree_response.status_code = 200
            tree_response.json.return_value = {
                "tree": [
                    {"path": "README.md", "type": "blob"},
                    {"path": "src/main.py", "type": "blob"},
                    {"path": "docs/guide.md", "type": "blob"},
                ]
            }

            # Mock raw file content responses
            readme_response = MagicMock()
            readme_response.status_code = 200
            readme_response.text = "# My Project\n\nThis is a test project."

            py_response = MagicMock()
            py_response.status_code = 200
            py_response.text = "def main():\n    print('hello')"

            docs_response = MagicMock()
            docs_response.status_code = 200
            docs_response.text = "# Documentation\n\nSome docs."

            # Setup mock to return different responses based on URL
            def get_side_effect(url, **kwargs):
                if "api.github.com" in url and "git/trees" in url:
                    return tree_response
                elif "api.github.com" in url:
                    return repo_info_response
                elif "README.md" in url:
                    return readme_response
                elif "main.py" in url:
                    return py_response
                elif "guide.md" in url:
                    return docs_response
                else:
                    response = MagicMock()
                    response.status_code = 404
                    return response

            mock_client.get = AsyncMock(side_effect=get_side_effect)

            result = await service.fetch_repo_files(
                "https://github.com/testowner/testrepo"
            )

            # Verify we got some files
            assert len(result) > 0
            paths = [f.path for f in result]
            assert "README.md" in paths or any("README" in p for p in paths)


class TestRepoIngestion:
    """Tests for ingesting repo files into Chroma."""

    def test_ingest_repo_files_empty_list(self):
        """Test behavior when no files are provided."""
        result = ingest_repo_files_into_chroma(
            repo_url="https://github.com/test/repo",
            arxiv_id="2301.00000",
            repo_files=[],
        )
        assert result == 0

    def test_ingest_repo_files_mock(self):
        """Test repo ingestion with mocked embedding service."""
        # Create mock repo files
        repo_files = [
            RepoFile.from_path("README.md", "# Project\n\nDescription here."),
            RepoFile.from_path("src/main.py", "def main():\n    pass"),
        ]

        with patch("app.services.gemini_service.GeminiEmbeddingService") as mock_embedder_cls:
            mock_embedder = MagicMock()
            mock_embedder_cls.return_value = mock_embedder
            # Return fake embeddings
            mock_embedder.embed_texts.return_value = [
                [0.1] * 768,  # 768-dim embedding
                [0.2] * 768,
            ]

            with patch("app.services.gemini_service.ChromaService") as mock_chroma_cls:
                mock_chroma = MagicMock()
                mock_chroma_cls.return_value = mock_chroma

                result = ingest_repo_files_into_chroma(
                    repo_url="https://github.com/test/repo",
                    arxiv_id="2301.00000",
                    repo_files=repo_files,
                    base_metadata={"title": "Test Paper"},
                )

                # Verify upsert was called
                assert mock_chroma.upsert.called
                call_args = mock_chroma.upsert.call_args

                # Check IDs include arxiv_id and repo_url
                ids = call_args.kwargs["ids"]
                assert len(ids) == 2
                assert all("2301.00000" in id for id in ids)
                assert all("github" in id for id in ids)

                # Check metadatas include source=github
                metadatas = call_args.kwargs["metadatas"]
                assert all(m["source"] == "github" for m in metadatas)
                assert all(m["arxiv_id"] == "2301.00000" for m in metadatas)

                assert result == 2


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
