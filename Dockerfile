FROM python:3.11

WORKDIR /app

COPY . /app

RUN pip install --upgrade pip

RUN pip install --no-cache-dir -r requirements.txt

CMD gunicorn -b 0.0.0.0:8000 -w 4 main:app
