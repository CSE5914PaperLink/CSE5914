FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
# build-essential for compiling some python packages
# curl for installing poetry
RUN apt-get update && apt-get install -y \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Poetry
RUN curl -sSL https://install.python-poetry.org | python3 -
ENV PATH="/root/.local/bin:$PATH"

# Copy project files
COPY pyproject.toml poetry.lock ./

# Install dependencies
# We install dev dependencies too if needed for running tests in CI, but for prod we might skip them.
# However, the user didn't specify separate groups strictly, so we install default.
RUN poetry config virtualenvs.create false \
    && poetry install --no-interaction --no-ansi --no-root

# Pre-download Docling models to avoid runtime timeouts/rate-limits
# Set Hugging Face cache directory
ENV HF_HOME=/app/hf_cache

# Pre-download Docling models to avoid runtime timeouts/rate-limits
# We explicitly trigger the download of the layout model
RUN python3 -c "from docling.document_converter import DocumentConverter, PdfFormatOption; \
from docling.datamodel.pipeline_options import PdfPipelineOptions; \
pipeline_options = PdfPipelineOptions(); \
pipeline_options.do_ocr = False; \
pipeline_options.do_table_structure = False; \
DocumentConverter(format_options={ \
    'pdf': PdfFormatOption(pipeline_options=pipeline_options) \
}).convert('https://arxiv.org/pdf/2408.09869')" || true

# Copy the rest of the application
COPY . .

# Expose port 8080 (Cloud Run default)
EXPOSE 8080

# Run the application
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8080"]
