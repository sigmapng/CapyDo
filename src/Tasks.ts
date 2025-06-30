class Tasks {
  id: number;
  taskName: string;
  status: string;
  importance: string;
  dueTo: number;
  dateCreated: number;

  constructor(
    id: number,
    taskName: string,
    status: string,
    importance: string,
    dueTo: number,
    dateCreated: number
  ) {
    this.id = id;
    this.taskName = taskName;
    this.status = status;
    this.importance = importance;
    this.dueTo = dueTo;
    this.dateCreated = dateCreated;
  }
}
