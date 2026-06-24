import shutil
import subprocess
import tempfile
import uuid
from pathlib import Path


class OfficeConversionError(RuntimeError):
    pass


def _resolve_soffice() -> str:
    soffice = shutil.which("soffice")
    if not soffice:
        raise OfficeConversionError(
            "LibreOffice is not installed. Install with: apt install libreoffice-writer libreoffice-calc libreoffice-impress"
        )
    return soffice


def convert_to_pdf(data: bytes, suffix: str) -> bytes:
    """Convert an Office document to PDF via LibreOffice headless."""
    soffice = _resolve_soffice()
    suffix = suffix.lower().lstrip(".")
    if not suffix:
        raise OfficeConversionError("Missing file extension")

    with tempfile.TemporaryDirectory() as tmp:
        tmp_path = Path(tmp)
        input_path = tmp_path / f"input.{suffix}"
        input_path.write_bytes(data)

        profile_dir = tmp_path / f"profile_{uuid.uuid4().hex}"
        profile_dir.mkdir()
        profile_uri = profile_dir.as_uri()

        result = subprocess.run(
            [
                soffice,
                f"-env:UserInstallation={profile_uri}",
                "--headless",
                "--convert-to",
                "pdf",
                "--outdir",
                str(tmp_path),
                str(input_path),
            ],
            check=False,
            capture_output=True,
            text=True,
            timeout=120,
        )

        if result.returncode != 0:
            stderr = result.stderr.strip() or result.stdout.strip() or "Unknown error"
            raise OfficeConversionError(f"LibreOffice conversion failed: {stderr}")

        output_path = tmp_path / "input.pdf"
        if not output_path.is_file():
            pdf_files = list(tmp_path.glob("*.pdf"))
            if not pdf_files:
                raise OfficeConversionError("LibreOffice did not produce a PDF output")
            output_path = pdf_files[0]

        return output_path.read_bytes()
