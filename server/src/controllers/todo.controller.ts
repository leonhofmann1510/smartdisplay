import { Request, Response } from "express";
import { sendSuccess } from "../utils/response";
import { JsonHandler } from "../utils/jsonHandler";
import { ITodo } from "../../../shared/models/ITodo";
import { io } from "../index";

let store: JsonHandler | null = null;
const getStore = (): Promise<JsonHandler> => {
  if (!store) return JsonHandler.open('todoData').then(s => (store = s));
  return Promise.resolve(store);
};

export const getTodos = async (req: Request, res: Response) => {
  const store = await getStore();
  const todos = store.get<ITodo[]>("todos") ?? [];
  sendSuccess(res, todos, "Todos retrieved successfully");
};

export const addTodo = async (req: Request, res: Response) => {
  const store = await getStore();
  const { text } = req.body;

  const newTodo: ITodo = {
    id: Date.now().toString(),
    text,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const todos = store.get<ITodo[]>("todos") ?? [];
  todos.push(newTodo);
  store.set("todos", todos as unknown as Parameters<typeof store.set>[1]);

  io.emit('todosChange', todos);
  sendSuccess(res, newTodo, "Todo added successfully");
};

export const updateTodo = async (req: Request, res: Response) => {
  const store = await getStore();
  const { id } = req.params;
  const { text } = req.body;

  const todos = store.get<ITodo[]>("todos") ?? [];
  const todoIndex = todos.findIndex(t => t.id === id);

  if (todoIndex === -1) {
    return sendSuccess(res, null, "Todo not found", 404);
  }

  todos[todoIndex].text = text;
  todos[todoIndex].updatedAt = new Date().toISOString();
  store.set("todos", todos as unknown as Parameters<typeof store.set>[1]);

  io.emit('todosChange', todos);
  sendSuccess(res, todos[todoIndex], "Todo updated successfully");
};

export const deleteTodo = async (req: Request, res: Response) => {
  const store = await getStore();
  const { id } = req.params;

  let todos = store.get<ITodo[]>("todos") ?? [];
  const originalLength = todos.length;
  todos = todos.filter(t => t.id !== id);

  if (todos.length === originalLength) {
    return sendSuccess(res, null, "Todo not found", 404);
  }

  store.set("todos", todos as unknown as Parameters<typeof store.set>[1]);

  io.emit('todosChange', todos);
  sendSuccess(res, null, "Todo deleted successfully");
};
