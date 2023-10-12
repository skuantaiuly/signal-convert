FROM python:3.8

WORKDIR /app

COPY . /app

RUN pip install --upgrade pip

RUN pip install --no-cache-dir -r requirements.txt

CMD gunicorn main:app --bind $HOST:$PORT
