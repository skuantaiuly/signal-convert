FROM python:3.8

WORKDIR /app

COPY . /app

RUN pip install --upgrade pip

RUN pip install --no-cache-dir -r requirements.txt

CMD gunicorn main:app --workers 2 --worker-class uvicorn.workers.UvicornWorker --host $HOST --port $PORT
