import os
import asyncio

from fastapi import FastAPI, HTTPException, UploadFile, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi.templating import Jinja2Templates
from starlette.responses import HTMLResponse

from signals import Signals
from schemas import SignalParams

app = FastAPI(title='Signals API', version='0.1.0')

app.mount("/static", StaticFiles(directory="static"), name="static")

templates = Jinja2Templates(directory="templates")

signals = Signals('static/signals.json')

app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def is_valid_extension(filename):
    valid_extensions = {".xlsx"}
    ext = os.path.splitext(filename)[1]
    return ext.lower() in valid_extensions


async def delete_file_after_delay(file_path: str, delay_seconds: int):
    await asyncio.sleep(delay_seconds)
    os.remove(file_path)


@app.get("/api/convert-signal/{signal_param}")
async def convert_signals(signal_param: str):
    try:
        return {
            'param': signal_param,
            'values': signals.get_signals_by_param(signal_param)
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/api/convert-signals/")
async def convert_signals(signal_params: SignalParams):
    try:
        return {
            'position': signal_params.position,
            'values': signals.get_signals_by_model(signal_params)
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/api/convert-signals/by-params")
async def convert_signals_by_params(params: list[str]):
    try:
        return {
            'values': signals.get_signals_by_params(params)
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/api/convert-signals/by-xlsx")
async def convert_signals_by_xlsx(xlsx_file: UploadFile):
    if not is_valid_extension(xlsx_file.filename):
        raise HTTPException(status_code=400, detail="Only XLSX files are allowed")

    processed_data = signals.get_signals_by_xlsx_params(xlsx_file.file.read())
    file_name = f"{xlsx_file.filename[:-5]}_processed.xlsx"
    output_path = signals.save_data_to_file(processed_data, file_name)
    headers = {'Content-Disposition': f'attachment; filename={file_name}'}
    response = FileResponse(output_path, headers=headers)

    asyncio.create_task(delete_file_after_delay(output_path, 3))

    return response


@app.get("/convert-signals/", response_class=HTMLResponse)
async def read_item(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})
