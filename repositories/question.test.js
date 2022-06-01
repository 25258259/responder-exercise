const { writeFile, rm } = require('fs/promises')
const { faker } = require('@faker-js/faker')
const { makeQuestionRepository } = require('./question')

describe('question repository', () => {
  const TEST_QUESTIONS_FILE_PATH = 'test-questions.json'
  let questionRepo

  beforeAll(async () => {
    await writeFile(TEST_QUESTIONS_FILE_PATH, JSON.stringify([]))

    questionRepo = makeQuestionRepository(TEST_QUESTIONS_FILE_PATH)
  })

  afterAll(async () => {
    await rm(TEST_QUESTIONS_FILE_PATH)
  })

  test('getQuestions should return a list of 0 questions', async () => {
    expect(await questionRepo.getQuestions()).toHaveLength(0)
  })

  test('getQuestions should return a list of 2 questions', async () => {
    const testQuestions = [
      {
        id: faker.datatype.uuid(),
        summary: 'What is my name?',
        author: 'Jack London',
        answers: []
      },
      {
        id: faker.datatype.uuid(),
        summary: 'Who are you?',
        author: 'Tim Doods',
        answers: []
      }
    ]

    await writeFile(TEST_QUESTIONS_FILE_PATH, JSON.stringify(testQuestions))

    expect(await questionRepo.getQuestions()).toHaveLength(2)
  })

  test('getQuestionById should return 1 question of specified id', async () => {
    const questionId = faker.datatype.uuid()
    const questionToFind = {
      id: questionId,
      summary: "What's your name?",
      author: 'Tester',
      answers: []
    }
    const testQuestions = [
      questionToFind,
      {
        id: faker.datatype.uuid(),
        summary: 'How are you?',
        author: 'Tester',
        answers: []
      }
    ]

    await writeFile(TEST_QUESTIONS_FILE_PATH, JSON.stringify(testQuestions))

    expect(await questionRepo.getQuestionById(questionId)).toMatchObject({
      code: 200,
      question: questionToFind
    })
  })

  test('getQuestionById should return code 400 with inappropriate id message', async () => {
    let questionId = faker.datatype.uuid()
    const testQuestions = [
      {
        id: faker.datatype.uuid(),
        summary: "What's your name?",
        author: 'Tester',
        answers: []
      },
      {
        id: faker.datatype.uuid(),
        summary: 'How are you?',
        author: 'Tester',
        answers: []
      }
    ]
    questionId = questionId.slice(1, 5)
    await writeFile(TEST_QUESTIONS_FILE_PATH, JSON.stringify(testQuestions))

    expect(await questionRepo.getQuestionById(questionId)).toMatchObject({
      code: 400,
      question: 'You need to provide correct question id'
    })
  })
  test('getQuestionById should return code 404 with no element found message', async () => {
    const questionId = faker.datatype.uuid()
    const testQuestions = [
      {
        id: faker.datatype.uuid(),
        summary: "What's your name?",
        author: 'Tester',
        answers: []
      },
      {
        id: faker.datatype.uuid(),
        summary: 'How are you?',
        author: 'Tester',
        answers: []
      }
    ]

    await writeFile(TEST_QUESTIONS_FILE_PATH, JSON.stringify(testQuestions))

    expect(await questionRepo.getQuestionById(questionId)).toMatchObject({
      code: 404,
      question: `Cannot find question with id: ${questionId}`
    })
  })
  test('getAnswers should return a list of 2 answers', async () => {
    const testAnswers = [
      {
        id: faker.datatype.uuid(),
        author: 'Tester0',
        summary: 'I am fine'
      },
      {
        id: faker.datatype.uuid(),
        author: 'Tester1',
        summary: 'I am not fine'
      }
    ]

    const questionIdWithAnswers = faker.datatype.uuid()
    const testQuestions = [
      {
        id: questionIdWithAnswers,
        summary: 'How are you?',
        author: 'Tester',
        answers: testAnswers
      }
    ]

    await writeFile(TEST_QUESTIONS_FILE_PATH, JSON.stringify(testQuestions))

    expect(await questionRepo.getAnswers(questionIdWithAnswers)).toMatchObject({
      code: 200,
      answers: testAnswers
    })
  })
  test('getAnswers should return a list of 0 answers', async () => {
    const questionIdWithAnswers = faker.datatype.uuid()
    const testQuestions = [
      {
        id: questionIdWithAnswers,
        summary: 'How are you?',
        author: 'Tester',
        answers: []
      }
    ]

    await writeFile(TEST_QUESTIONS_FILE_PATH, JSON.stringify(testQuestions))

    expect(await questionRepo.getAnswers(questionIdWithAnswers)).toMatchObject({
      code: 200,
      answers: []
    })
  })
  test('getAnswers should return code 400 with inappropriate question id message', async () => {
    const testAnswers = [
      {
        id: faker.datatype.uuid(),
        author: 'Tester0',
        summary: 'I am fine'
      },
      {
        id: faker.datatype.uuid(),
        author: 'Tester1',
        summary: 'I am not fine'
      }
    ]

    let questionIdWithAnswers = faker.datatype.uuid()
    const testQuestions = [
      {
        id: questionIdWithAnswers,
        summary: 'How are you?',
        author: 'Tester',
        answers: testAnswers
      }
    ]
    questionIdWithAnswers = questionIdWithAnswers.slice(1, 5)
    await writeFile(TEST_QUESTIONS_FILE_PATH, JSON.stringify(testQuestions))

    expect(await questionRepo.getAnswers(questionIdWithAnswers)).toMatchObject({
      code: 400,
      answers: `You need to provide correct question id`
    })
  })

  test('addQuestion should save sended question', async () => {
    const testQuestions = [
      {
        id: faker.datatype.uuid(),
        summary: 'How are you?',
        author: 'Tester',
        answers: []
      }
    ]

    await writeFile(TEST_QUESTIONS_FILE_PATH, JSON.stringify(testQuestions))
    const testQuestion = {
      id: faker.datatype.uuid(),
      summary: "What's your name?",
      author: 'Tester',
      answers: []
    }

    expect(await questionRepo.addQuestion(testQuestion)).toMatchObject({
      code: 201,
      questions: [...testQuestions, testQuestion]
    })
  })
  test('addQuestion should return code 400 with inappropriate id message', async () => {
    const testQuestions = [
      {
        id: faker.datatype.uuid(),
        summary: 'How are you?',
        author: 'Tester',
        answers: []
      }
    ]

    await writeFile(TEST_QUESTIONS_FILE_PATH, JSON.stringify(testQuestions))
    const testQuestion = {
      id: '',
      summary: "What's your name?",
      author: 'Tester',
      answers: []
    }

    expect(await questionRepo.addQuestion(testQuestion)).toMatchObject({
      code: 400,
      questions: 'You need to provide correct id for your question'
    })
  })
  test('addQuestion should return code 400 with no summary message', async () => {
    const testQuestions = [
      {
        id: faker.datatype.uuid(),
        summary: 'How are you?',
        author: 'Tester',
        answers: []
      }
    ]

    await writeFile(TEST_QUESTIONS_FILE_PATH, JSON.stringify(testQuestions))
    const testQuestion = {
      id: faker.datatype.uuid(),
      summary: '',
      author: 'Tester',
      answers: []
    }

    expect(await questionRepo.addQuestion(testQuestion)).toMatchObject({
      code: 400,
      questions: 'You need to provide summary for your question'
    })
  })
  test('addQuestion should return code 400 with no author message', async () => {
    const testQuestions = [
      {
        id: faker.datatype.uuid(),
        summary: 'How are you?',
        author: 'Tester',
        answers: []
      }
    ]

    await writeFile(TEST_QUESTIONS_FILE_PATH, JSON.stringify(testQuestions))
    const testQuestion = {
      id: faker.datatype.uuid(),
      summary: "What's your name?",
      author: '',
      answers: []
    }

    expect(await questionRepo.addQuestion(testQuestion)).toMatchObject({
      code: 400,
      questions: 'You need to provide author for your question'
    })
  })
  test('addAnswer should save answer and return question with new answers', async () => {
    const testQuestionId = faker.datatype.uuid()
    let testQuestions = [
      {
        id: testQuestionId,
        summary: 'How are you?',
        author: 'Tester',
        answers: []
      }
    ]

    await writeFile(TEST_QUESTIONS_FILE_PATH, JSON.stringify(testQuestions))
    const testAnswer = {
      id: faker.datatype.uuid(),
      summary: 'I am fine',
      author: 'Tester'
    }

    testQuestions[0].answers = [testAnswer]

    expect(
      await questionRepo.addAnswer(testQuestionId, testAnswer)
    ).toMatchObject({
      code: 201,
      question: testQuestions[0]
    })
  })
  test('addAnswer should return code 400 with inappropiate answer id message', async () => {
    const testQuestionId = faker.datatype.uuid()
    let testQuestions = [
      {
        id: testQuestionId,
        summary: 'How are you?',
        author: 'Tester',
        answers: []
      }
    ]

    await writeFile(TEST_QUESTIONS_FILE_PATH, JSON.stringify(testQuestions))
    const testAnswer = {
      id: '',
      summary: 'I am fine',
      author: 'Tester'
    }

    testQuestions[0].answers = [testAnswer]

    expect(
      await questionRepo.addAnswer(testQuestionId, testAnswer)
    ).toMatchObject({
      code: 400,
      question: 'You need to provide correct id for your answer'
    })
  })
  test('addAnswer should return code 400 with no author message', async () => {
    const testQuestionId = faker.datatype.uuid()
    let testQuestions = [
      {
        id: testQuestionId,
        summary: 'How are you?',
        author: 'Tester',
        answers: []
      }
    ]

    await writeFile(TEST_QUESTIONS_FILE_PATH, JSON.stringify(testQuestions))
    const testAnswer = {
      id: faker.datatype.uuid(),
      summary: 'I am fine',
      author: ''
    }

    testQuestions[0].answers = [testAnswer]

    expect(
      await questionRepo.addAnswer(testQuestionId, testAnswer)
    ).toMatchObject({
      code: 400,
      question: 'You need to specify author'
    })
  })
  test('addAnswer should return code 400 with no summary message', async () => {
    const testQuestionId = faker.datatype.uuid()
    let testQuestions = [
      {
        id: testQuestionId,
        summary: 'How are you?',
        author: 'Tester',
        answers: []
      }
    ]

    await writeFile(TEST_QUESTIONS_FILE_PATH, JSON.stringify(testQuestions))
    const testAnswer = {
      id: faker.datatype.uuid(),
      summary: '',
      author: 'Tester'
    }

    testQuestions[0].answers = [testAnswer]

    expect(
      await questionRepo.addAnswer(testQuestionId, testAnswer)
    ).toMatchObject({
      code: 400,
      question: 'You need to specify summary'
    })
  })
  test('addAnswer should return code 404 with no question found message', async () => {
    const testQuestionId = faker.datatype.uuid()
    let testQuestions = [
      {
        id: faker.datatype.uuid(),
        summary: 'How are you?',
        author: 'Tester',
        answers: []
      }
    ]

    await writeFile(TEST_QUESTIONS_FILE_PATH, JSON.stringify(testQuestions))
    const testAnswer = {
      id: faker.datatype.uuid(),
      summary: 'I am fine',
      author: 'Tester'
    }

    testQuestions[0].answers = [testAnswer]

    expect(
      await questionRepo.addAnswer(testQuestionId, testAnswer)
    ).toMatchObject({
      code: 404,
      question: `Cannot find question with id: ${testQuestionId}`
    })
  })
  test('getAnswer should return answer of specified id', async () => {
    const testAnswerId = faker.datatype.uuid()
    const testAnswer = {
      id: testAnswerId,
      author: 'Tester0',
      summary: 'I am fine'
    }

    const testAnswers = [
      testAnswer,
      {
        id: faker.datatype.uuid(),
        author: 'Tester1',
        summary: 'I am not fine'
      }
    ]

    let questionIdWithAnswers = faker.datatype.uuid()
    const testQuestions = [
      {
        id: questionIdWithAnswers,
        summary: 'How are you?',
        author: 'Tester',
        answers: testAnswers
      }
    ]

    await writeFile(TEST_QUESTIONS_FILE_PATH, JSON.stringify(testQuestions))
    expect(
      await questionRepo.getAnswer(questionIdWithAnswers, testAnswerId)
    ).toMatchObject({
      code: 200,
      answer: testAnswer
    })
  })
})
