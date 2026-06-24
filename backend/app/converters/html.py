import tempfile
from pathlib import Path


class HtmlConversionError(RuntimeError):
    pass


def html_to_pdf(data: bytes) -> bytes:
    """Render HTML/CSS to PDF with WeasyPrint (preserves styles better than LibreOffice)."""
    try:
        from weasyprint import HTML
    except (ImportError, OSError) as exc:
        raise HtmlConversionError(
            "WeasyPrint is not available. Install Python package and system libraries "
            "(see https://doc.courtbouillon.org/weasyprint/stable/first_steps.html)"
        ) from exc

    with tempfile.TemporaryDirectory() as tmp:
        tmp_path = Path(tmp)
        html_path = tmp_path / "input.html"
        html_path.write_bytes(data)

        try:
            return HTML(filename=str(html_path), base_url=str(tmp_path)).write_pdf()
        except Exception as exc:
            raise HtmlConversionError(f"HTML rendering failed: {exc}") from exc
