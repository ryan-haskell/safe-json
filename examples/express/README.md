# examples/express

This is an example of using `@ryannhg/safe-json` with ExpressJS's `req.body` without worrying about `any` destroying your hopes and dreams! 💖

## running it locally

```bash
# gets the codes
git clone git@github.com:ryannhg/safe-json.git
cd safe-json/examples/express

# runs the nodes
npm start
```

Once the server is ready at http://localhost:3000 you can run these `curl` commands to see the validator in action.

1. `POST /api/people` - 200 ✅

> this request body passes the `person` validator.

```bash
curl -X POST 'http://localhost:3000/api/people' \
  -H 'Content-Type: application/json' \
  -d '{ "name": "Ryan", "age": 123 }'
```

2. `POST /api/people` - 400 🚫

> this request body is missing the "age" field

```bash
curl -X POST 'http://localhost:3000/api/people' \
  -H 'Content-Type: application/json' \
  -d '{ "name": "Ryan" }'
```

3. `POST /api/posts` - 200 ✅

> this request body passes the `posts` validator.

```bash
curl -X POST 'http://localhost:3000/api/posts' \
  -H 'Content-Type: application/json' \
  -d '{ "title": "Ryan", "body": "Hello world!" }'
```

4. `POST /api/posts` - 200 🚫

> this request body is passing in body as a boolean

```bash
curl -X POST 'http://localhost:3000/api/posts' \
  -H 'Content-Type: application/json' \
  -d '{ "title": "Ryan", "body": true }'
```