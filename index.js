const express = require('express')
const { urlencoded, json } = require('body-parser')
const makeRepositories = require('./middleware/repositories')

const STORAGE_FILE_PATH = 'questions.json'
const PORT = 3000

const app = express()

app.use(urlencoded({ extended: true }))
app.use(json())
app.use(makeRepositories(STORAGE_FILE_PATH))

app.get('/', (_, res) => {
  res.json({ message: 'Welcome to responder!' })
})

app.get('/questions', async (req, res) => {
  const questions = await req.repositories.questionRepo.getQuestions()
  res.json(questions)
})

app.get('/questions/:questionId', async (req, res) => {
  const { questionId } = req.params
  const { code, question } =
    await req.repositories.questionRepo.getQuestionById(questionId)

  res.status(code).json(question)
})

app.post('/questions', async (req, res) => {
  const questionToAppend = req.body
  const { code, questions } = await req.repositories.questionRepo.addQuestion(
    questionToAppend
  )

  res.status(code).json(questions)
})

app.get('/questions/:questionId/answers', async (req, res) => {
  const { questionId } = req.params
  const { code, answers } = await req.repositories.questionRepo.getAnswers(
    questionId
  )
  res.status(code).json(answers)
})

app.post('/questions/:questionId/answers', async (req, res) => {
  const { questionId } = req.params
  const answerToAppend = req.body
  const { code, question } = await req.repositories.questionRepo.addAnswer(
    questionId,
    answerToAppend
  )

  res.status(code).json(question)
})

app.get('/questions/:questionId/answers/:answerId', async (req, res) => {
  const { questionId, answerId } = req.params

  const { code, answer } = await req.repositories.questionRepo.getAnswer(
    questionId,
    answerId
  )

  res.status(code).json(answer)
})

app.listen(PORT, () => {
  console.log(`Responder app listening on port ${PORT}`)
})
