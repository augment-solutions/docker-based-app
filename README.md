# Docker-based Node.js App

A small Express application backed by PostgreSQL and Redis. Each request to the root route increments a Redis page-view counter and records a visit in PostgreSQL.

## Run

```sh
docker compose up --build
```

Open <http://localhost:8080>. Refresh the page to increment both counters.

Stop the stack with `docker compose down`. To also remove persisted database and Redis data, run `docker compose down --volumes`.
