# Test script to check image extraction

Write-Host "=== Checking what's in Chroma ===" -ForegroundColor Cyan
try {
    $result = Invoke-RestMethod -Uri "http://localhost:8000/library/debug/list_all"
    Write-Host "Total documents: $($result.total_docs)" -ForegroundColor Green
    foreach ($doc in $result.documents) {
        Write-Host "`nDoc ID: $($doc.doc_id)" -ForegroundColor Yellow
        Write-Host "  Title: $($doc.title)"
        Write-Host "  Chunks: $($doc.chunk_count)"
        Write-Host "  Images: $($doc.image_count)" -ForegroundColor $(if ($doc.image_count -gt 0) { "Green" } else { "Red" })
    }
} catch {
    Write-Host "Error checking Chroma: $_" -ForegroundColor Red
}

Write-Host "`n=== Re-ingesting a paper with images ===" -ForegroundColor Cyan
try {
    $arxivId = "2401.00001"
    Write-Host "Adding paper: $arxivId"
    $addResult = Invoke-RestMethod -Method POST -Uri "http://localhost:8000/library/add/$arxivId"
    Write-Host "Success!" -ForegroundColor Green
    Write-Host "  Chunks ingested: $($addResult.ingestion.chunks)"
    Write-Host "  Images extracted: $($addResult.ingestion.images)" -ForegroundColor $(if ($addResult.ingestion.images -gt 0) { "Green" } else { "Red" })
} catch {
    Write-Host "Error adding paper: $_" -ForegroundColor Red
    Write-Host $_.Exception.Message
}

Write-Host "`n=== Checking images for arxiv:$arxivId ===" -ForegroundColor Cyan
try {
    $images = Invoke-RestMethod -Uri "http://localhost:8000/library/images/arxiv:$arxivId"
    Write-Host "Found $($images.images.Count) images:" -ForegroundColor Green
    foreach ($img in $images.images) {
        Write-Host "  - $($img.filename) ($($img.media_type))"
    }
} catch {
    Write-Host "Error fetching images: $_" -ForegroundColor Red
}
