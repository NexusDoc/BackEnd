# Back-End do projeto

Para esecutar o projeto é necessário ter o python 3.10 ou superior instalado.
Começe criando o ambiente virtual com: ``````
```
python3 -m venv .venv
```

Enseguida ative o ambiente virtual.
linux/makOS:
```
source .venv/bin/activate
```

windows:
```
.\.venv\scripts\activate
```
depois instale as dependencias do projeto com o comando:

```
python -m pip install -r requirements.txt
```

depois esecute o comando:
```
docker comepose up -d
```

para subir o MySQL, e enseguida rode os comandos do alembic:
Gerar uma revisão (apenas na primeira vez ou quando seus models mudarem):
```
alembic revision --autogenerate -m "init schema"
```

Aplicar as migrações:
```
alembic upgrade head

```

comando para rodar a API localmente:
```
uvicorn src.main:app --reload --port 8000
```

## Sobre a modelagem do banco de dados
Aqui usamos o um para um ou seja, um usuário só tem um telefone e um email.

## Como testar
na pasta example_http, temos exemplo de como fazer cada teste http e e também como funciona cada endpoint da api.
se preferir seguir o Swagger este é o link:
http://127.0.0.1:8000/docs