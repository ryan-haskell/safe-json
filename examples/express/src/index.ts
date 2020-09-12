import { Expect, Validator } from '@ryannhg/safe-json'
import express from 'express'


// define some types
type Person = {
  name: string,
  age: number
}

type BlogPost = {
  title: string,
  body: string
}

// define some validators
const person: Validator<Person> =
  Expect.object({
    name: Expect.string,
    age: Expect.number
  })

const blogPost: Validator<BlogPost> =
  Expect.object({
    title: Expect.string,
    body: Expect.string
  })

// Create an express server
const app = express()

app.get('/', (_, res) => res.send('Homepage'))

app.use(express.json())

// example using "validator.worksWith"
app.post('/api/people', (req, res) => {
  if (person.worksWith(req.body)) {
    const { name, age } = req.body
    res.status(200).json({ status: 200, name, age })
  } else {
    res.status(400).json({ status: 400, error: "name and age are required." })
  }
})

// example using "validator.run"
app.post('/api/posts', (req, res) =>
  blogPost.run(req.body, {
    onPass: post => res.status(200).json({ status: 200, post }),
    onFail: reason => res.status(400).json({ status: 400, reason })
  })
)

app.listen(3000, () => console.info(`Ready at http://localhost:3000`))