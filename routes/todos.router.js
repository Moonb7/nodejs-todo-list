import express from 'express';
import joi from 'joi';
import Todo from '../schemas/todo.schema.js';

const router = express.Router();

/*
👉 **할 일 생성 API 유효성 검사 요구사항**

1. `value` 데이터는 **필수적으로 존재**해야한다.
2. `value` 데이터는 **문자열 타입**이어야한다.
3. `value` 데이터는 **최소 1글자 이상**이어야한다.
4. `value` 데이터는 **최대 50글자 이하**여야한다.
5. 유효성 검사에 실패했을 때, 에러가 발생해야한다.
*/
const createdTodoSchema = joi.object({
  value: joi.string().min(1).max(50).required(),
});

/** 할일 등록 API **/ // 데이터 베이스를 이용할 때는 async await같이 비동기적으로 데이터를 안전하게 전달하고 가져오는게 바람직합니다.
router.post('/todos', async (req, res, next) => {
  try {
    // // 1. 클라이언트로 부터 받아온 value 데이터를 가져옵니다.
    // const { value } = req.body;

    const validation = await createdTodoSchema.validateAsync(req.body);

    const { value } = validation;

    // 1-5. 만약, 클라이언트가 value 데이터를 전달하지 않았을 때, 클라이언트에게 에러 메시지를 전달합니다.
    if (!value) {
      return res
        .status(400)
        .json({ errorMessage: '해야할 일(value) 데이터가 존재하지 않습니다.' });
    }

    // 2. 해당하는 마지막 order 데이터를 조회합니다.
    // findOne : 1개의 데이터만 조회합니다.
    // sort : 정렬한다. -> 어떤 컬럼을?
    const todoMaxOrder = await Todo.findOne().sort('-order').exec(); // 정렬할 컬럼 기준으로 "-"하면 설정한 컬럼 기준으로 내림차순으로 정렬합니다.

    // 3. 만약 존재한다면 혀냊 해야 할 일을 +1 하고, 할일의 순서를 나타내는 컬럼 "order" 데이터가 존재하지 않으면, 1로 할당합니다.
    const order = todoMaxOrder ? todoMaxOrder.order + 1 : 1;

    // 4. 해야 할 일 등록
    const todo = new Todo({ value, order });
    await todo.save();

    // 5. 해야할 일을 클라이언트에게 반환합니다.
    return res.status(201).json({ todo: todo });
  } catch (error) {
    // Router 다음에 있는 에러 처리 미들웨어를 실행합니다.
    next(error); // 다음 미들웨어에게 에러를 넘겨준다는 의미도 있네요
  }
});

/** 해야할 일 목록 조회 GET **/
router.get('/todos', async (req, res, next) => {
  // 1. 해야할 일 목록 조회를 진행합니다.
  const todos = await Todo.find().sort('-order').exec();

  // 2. 해야할 일 목록 조회 겨로가를 클라이언트에게 반환합니다.
  return res.status(200).json({ todos: todos });
});

/** 해야할 일 순서 변경, 완료 / 해제 API **/
router.patch('/todos/:todoId', async (req, res, next) => {
  const { todoId } = req.params;
  const { order, done, value } = req.body;

  // 현재 나의 order가 무엇인지 알아야합니다.
  const currentTodo = await Todo.findById(todoId).exec();
  if (!currentTodo) {
    return res
      .status(404)
      .json({ errorMessage: '존재하지 않는 데이터입니다.' });
  }

  if (order) {
    const targetTodo = await Todo.findOne({ order }).exec();
    if (targetTodo) {
      targetTodo.order = currentTodo.order;
      await targetTodo.save();
    }

    currentTodo.order = order;
  }

  if (done !== undefined) {
    // 즉, null이거나 값이 있을때
    currentTodo.doneAt = done ? new Date() : null;
  }

  if (value) {
    currentTodo.value = value;
  }

  await currentTodo.save();

  return res.status(200).json({ currentTodo: currentTodo });
});

/** 할 일 삭제 API **/
router.delete('/todos/:todoId', async (req, res, next) => {
  const { todoId } = req.params;

  const todo = await Todo.findById(todoId).exec();
  if (!todo) {
    return res
      .status(404)
      .json({ errorMessage: '존재하지 않는 데이터입니다.' });
  }

  await Todo.deleteOne({ _id: todoId });

  return res.status(200).json({ Message: '삭제에 성공했습니다.' });
});

export default router;
