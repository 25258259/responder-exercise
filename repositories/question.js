const { readFile, writeFile } = require('fs/promises')
const { get } = require('http')
const uuid = require('uuid')

const makeQuestionRepository = fileName => {
  const getQuestions = async () => {
    const fileContent = await readFile(fileName, { encoding: 'utf-8' })
    const questions = JSON.parse(fileContent)

    return questions
  }

  const setQuestions = async questions => {
    const questionsToWrite = JSON.stringify(questions, null, '\t')
    await writeFile(fileName, questionsToWrite)
  }

  const getQuestionById = async questionId => {
    if (!questionId || !uuid.validate(questionId)) {
      return { code: 400, question: 'You need to provide correct question id' }
    }
    const questions = await getQuestions()

    const question = questions.filter(question => question.id === questionId)[0]
    if (!question) {
      return {
        code: 404,
        question: `Cannot find question with id: ${questionId}`
      }
    }
    return { code: 200, question }
  }

  const addQuestion = async question => {
    if (!question) {
      return { code: 400, questions: 'You need to provide a question' }
    }
    if (!question.summary) {
      return {
        code: 400,
        questions: 'You need to provide summary for your question'
      }
    }
    if (!question.author) {
      return {
        code: 400,
        questions: 'You need to provide author for your question'
      }
    }
    if (!question.id || !uuid.validate(question.id)) {
      return {
        code: 400,
        questions: 'You need to provide correct id for your question'
      }
    }

    let questions = await getQuestions()
    const newQuestions = [...questions, question]

    await setQuestions(newQuestions)

    return { code: 201, questions: newQuestions }
  }

  const getAnswers = async questionId => {
    const { code, question } = await getQuestionById(questionId)

    if (code !== 200) {
      return { code, answers: question }
    }
    return { code, answers: question.answers }
  }
  const getAnswer = async (questionId, answerId) => {
    const { code, answers } = await getAnswers(questionId)

    if (code !== 200) {
      return { code, answer: answers }
    }
    if (!answerId || !uuid.validate(answerId)) {
      return { code: 400, answer: 'You need to provide correct answer id' }
    }
    const answer = answers.filter(answer => answer.id === answerId)[0]

    if (!answer) {
      return { code: 404, answer: `Could not find answer with id: ${answerId}` }
    }
    return { code: 200, answer: answer }
  }
  const addAnswer = async (questionId, answer) => {
    const questions = await getQuestions()
    const { id, author, summary } = answer
    const { code, question } = await getQuestionById(questionId)
    if (code !== 200) {
      return { code, question: question }
    }
    if (!id || !uuid.validate(id)) {
      return {
        code: 400,
        question: 'You need to provide correct id for your answer'
      }
    }
    if (!author) {
      return { code: 400, question: 'You need to specify author' }
    }
    if (!summary) {
      return { code: 400, question: 'You need to specify summary' }
    }

    const newAnswers = [...question.answers, answer]
    let newQuestion
    const newQuestions = questions.map(question => {
      if (question.id === questionId) {
        newQuestion = {
          ...question,
          answers: newAnswers
        }
        return newQuestion
      }
      return question
    })
    await setQuestions(newQuestions)

    return { code: 201, question: newQuestion }
  }

  return {
    getQuestions,
    getQuestionById,
    addQuestion,
    getAnswers,
    getAnswer,
    addAnswer
  }
}

module.exports = { makeQuestionRepository }
