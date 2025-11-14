"""Service for fetching and processing GitHub repository files."""

from __future__ import annotations

import logging
from dataclasses import dataclass
from typing import Optional
from urllib.parse import urlparse

import httpx
import json

from app.core.config import settings

logger = logging.getLogger(__name__)


@dataclass
class RepoFile:
    """Represents a file fetched from a GitHub repository."""

    path: str
    """File path relative to repo root (e.g., 'README.md', 'src/main.py')."""

    content: str
    """Raw file content as text/string."""

    language: str = "unknown"
    """Programming language or file type (e.g., 'python', 'markdown', 'json')."""

    kind: str = "unknown"
    """File kind/category (e.g., 'readme', 'docs', 'code', 'notebook')."""

    @classmethod
    def from_path(cls, path: str, content: str) -> RepoFile:
        """Factory method to create a RepoFile with inferred language and kind."""
        language, kind = _infer_file_type(path)
        return cls(path=path, content=content, language=language, kind=kind)


def _infer_file_type(path: str) -> tuple[str, str]:
    """Infer programming language and file kind from file path."""
    path_lower = path.lower()

    # Kind inference (priority order)
    if path_lower.endswith("readme.md"):
        return "markdown", "readme"
    if path_lower.startswith("docs/"):
        return "markdown", "docs"
    if path_lower.endswith(".md"):
        return "markdown", "docs"
    if path_lower.endswith(".ipynb"):
        return "python", "notebook"

    # Language inference (code files)
    if path_lower.endswith(".py"):
        return "python", "code"
    if path_lower.endswith(".js") or path_lower.endswith(".jsx"):
        return "javascript", "code"
    if path_lower.endswith(".ts") or path_lower.endswith(".tsx"):
        return "typescript", "code"
    if path_lower.endswith(".java"):
        return "java", "code"
    if path_lower.endswith(".cpp") or path_lower.endswith(".cc"):
        return "cpp", "code"
    if path_lower.endswith(".go"):
        return "go", "code"
    if path_lower.endswith(".rs"):
        return "rust", "code"
    if path_lower.endswith(".json"):
        return "json", "config"
    if path_lower.endswith(".yaml") or path_lower.endswith(".yml"):
        return "yaml", "config"

    return "unknown", "unknown"


def normalize_github_url(url: str) -> str:
    """Normalize a GitHub URL to canonical https://github.com/owner/repo form.

    Examples:
        https://github.com/owner/repo -> https://github.com/owner/repo
        git@github.com:owner/repo.git -> https://github.com/owner/repo
        https://github.com/owner/repo.git -> https://github.com/owner/repo
    """
    url = url.strip()

    # Convert SSH URL to HTTPS
    if url.startswith("git@github.com:"):
        url = url.replace("git@github.com:", "https://github.com/")

    # Remove .git suffix
    if url.endswith(".git"):
        url = url[:-4]

    # Ensure https
    if url.startswith("http://github.com"):
        url = url.replace("http://", "https://")

    return url


def _extract_owner_repo(repo_url: str) -> tuple[str, str]:
    """Extract owner and repo name from a normalized GitHub URL.

    Args:
        repo_url: URL like https://github.com/owner/repo

    Returns:
        Tuple of (owner, repo)

    Raises:
        ValueError: If URL is malformed.
    """
    parsed = urlparse(repo_url)
    if parsed.netloc != "github.com":
        raise ValueError(f"Not a GitHub URL: {repo_url}")

    parts = parsed.path.strip("/").split("/")
    if len(parts) < 2:
        raise ValueError(f"Invalid GitHub URL format: {repo_url}")

    return parts[0], parts[1]


class GitHubService:
    """Service for fetching files from GitHub repositories."""

    def __init__(self, api_token: Optional[str] = None):
        """Initialize GitHub service.

        Args:
            api_token: GitHub API token for authenticated requests (optional).
                      If not provided, will attempt unauthenticated requests.
        """
        self._api_token = api_token or settings.github_api_token
        self._raw_url_base = settings.github_raw_url
        self._ua = "CSE5914-Backend/0.1 (https://github.com/jeevanadella/CSE5914)"

    def _get_headers(self) -> dict:
        """Build HTTP headers for API requests."""
        headers = {"User-Agent": self._ua}
        if self._api_token:
            headers["Authorization"] = f"token {self._api_token}"
        return headers

    def _get_raw_url(self, owner: str, repo: str, branch: str, path: str) -> str:
        """Build a raw.githubusercontent.com URL for a file."""
        return f"{self._raw_url_base}/{owner}/{repo}/{branch}/{path}"

    async def fetch_repo_files(self, repo_url: str) -> list[RepoFile]:
        """Fetch high-signal text files from a GitHub repository.

        Fetches:
        - README.md
        - docs/*.md files
        - src/**/*.py files (limited)
        - example/**/*.py files (limited)
        - .ipynb files (limited)

        Args:
            repo_url: GitHub repository URL (will be normalized).

        Returns:
            List of RepoFile objects. Empty list if fetch fails.
        """
        try:
            repo_url = normalize_github_url(repo_url)
            owner, repo = _extract_owner_repo(repo_url)
        except ValueError as e:
            logger.warning(f"Invalid GitHub URL: {repo_url}: {e}")
            return []

        files: list[RepoFile] = []
        async with httpx.AsyncClient(timeout=30.0) as client:
            # Try to get default branch from API
            default_branch = await self._get_default_branch(client, owner, repo)
            if not default_branch:
                logger.warning(
                    f"Could not determine default branch for {owner}/{repo}"
                )
                return []

            # Fetch README.md
            files.extend(
                await self._fetch_file(
                    client, owner, repo, default_branch, "README.md"
                )
            )

            # Fetch docs files
            files.extend(
                await self._fetch_tree(
                    client, owner, repo, default_branch, "docs", pattern="*.md"
                )
            )

            # Fetch src Python files
            files.extend(
                await self._fetch_tree(
                    client, owner, repo, default_branch, "src", pattern="*.py", limit=3
                )
            )

            # Fetch example Python files
            files.extend(
                await self._fetch_tree(
                    client,
                    owner,
                    repo,
                    default_branch,
                    "examples",
                    pattern="*.py",
                    limit=2,
                )
            )

            # Fetch notebook files
            files.extend(
                await self._fetch_tree(
                    client,
                    owner,
                    repo,
                    default_branch,
                    "",
                    pattern="*.ipynb",
                    limit=2,
                )
            )

        return files

    async def _get_default_branch(
        self, client: httpx.AsyncClient, owner: str, repo: str
    ) -> Optional[str]:
        """Get the default branch of a repository via GitHub API."""
        api_url = f"https://api.github.com/repos/{owner}/{repo}"
        try:
            resp = await client.get(api_url, headers=self._get_headers())
            if resp.status_code == 200:
                data = resp.json()
                return data.get("default_branch", "main")
        except Exception as e:
            logger.debug(f"Failed to fetch repo info from API: {e}")

        # Fallback to common branch names
        return "main"

    async def _fetch_file(
        self,
        client: httpx.AsyncClient,
        owner: str,
        repo: str,
        branch: str,
        path: str,
    ) -> list[RepoFile]:
        """Fetch a single file from the repository.

        Args:
            client: HTTP client
            owner: Repository owner
            repo: Repository name
            branch: Branch name
            path: File path relative to repo root

        Returns:
            List with one RepoFile if successful, empty list if file not found.
        """
        url = self._get_raw_url(owner, repo, branch, path)
        try:
            resp = await client.get(url, timeout=10.0)
            if resp.status_code == 200:
                content = resp.text
                return [RepoFile.from_path(path, content)]
        except Exception as e:
            logger.debug(f"Failed to fetch {path} from {owner}/{repo}: {e}")

        return []

    async def _fetch_tree(
        self,
        client: httpx.AsyncClient,
        owner: str,
        repo: str,
        branch: str,
        directory: str = "",
        pattern: str = "*",
        limit: int = 10,
    ) -> list[RepoFile]:
        """Fetch files from a directory in the repository.

        Uses GitHub API to list files, then fetches content for matched files.

        Args:
            client: HTTP client
            owner: Repository owner
            repo: Repository name
            branch: Branch name
            directory: Directory path (empty string for repo root)
            pattern: File pattern (e.g., "*.py", "*.md")
            limit: Maximum number of files to fetch

        Returns:
            List of RepoFile objects.
        """
        # Use GitHub API tree endpoint to list files
        api_url = f"https://api.github.com/repos/{owner}/{repo}/git/trees/{branch}"
        params = {"recursive": "1"}

        try:
            resp = await client.get(
                api_url, params=params, headers=self._get_headers()
            )
            if resp.status_code != 200:
                return []

            tree_data = resp.json().get("tree", [])
        except Exception as e:
            logger.debug(
                f"Failed to fetch tree from {owner}/{repo}/{directory}: {e}"
            )
            return []

        # Filter files by directory and pattern
        files: list[RepoFile] = []
        count = 0

        for item in tree_data:
            if item["type"] != "blob":  # Skip directories
                continue

            item_path: str = item["path"]

            # Filter by directory
            if directory:
                if not item_path.startswith(directory + "/"):
                    continue
                # Remove directory prefix
                relative_path = item_path[len(directory) + 1 :]
            else:
                relative_path = item_path

            # Filter by pattern
            if pattern != "*":
                ext = "." + pattern.split(".")[-1]
                if not item_path.endswith(ext):
                    continue

            # Fetch file content
            file_content = await self._fetch_file(
                client, owner, repo, branch, item_path
            )
            if file_content:
                files.extend(file_content)
                count += 1
                if count >= limit:
                    break

        return files
