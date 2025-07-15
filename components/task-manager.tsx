"use client";
import { supabase } from "@/lib/supabase";
import { Session } from "@supabase/supabase-js";
import { ChangeEvent, useEffect, useState } from "react";
import Image from "next/image";

interface Task {
  id: number;
  title: string;
  description: string;
  created_at: string;
  image_url: string;
}
const TaskManager = ({ session }: { session: Session }) => {
  // state to manage the new task input
  // we are using an object to manage the title and description of the task
  const [newTask, setNewTask] = useState({ title: "", description: "" });

  // state to manage the tasks fetched from the database
  const [tasks, setTasks] = useState<Task[]>([]);

  const [newDescription, setNewDescription] = useState("");

  const [taskImage, setTaskImage] = useState<File | null>(null);

  // Fetching the tasks from the database
  const fetchTasks = async () => {
    const { error, data } = await supabase
      .from("tasks")
      .select("*")
      .order("created_at", { ascending: true });
    if (error) {
      console.error("Error reading Task: ", error.message);
      return;
    }
    setTasks(data);
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    const filePath = `${file.name}-${Date.now()}`;
    const { error } = await supabase.storage
      .from("tasks-images")
      .upload(filePath, file);

    if (error) {
      console.error("Error uploading image: ", error.message);
      return null;
    }

    const { data } = await supabase.storage
      .from("tasks-images")
      .getPublicUrl(filePath);
    return data.publicUrl;
  };
  const handleSubmit = async (e: any) => {
    e.preventDefault();

    let imageUrl: string | null = null;

    if (taskImage) {
      imageUrl = await uploadImage(taskImage);
    }

    // checking if this returns an error then we send it to the console
    // if the error is not the case then we insert the new task into the database
    // we are using the insert method to insert the new task into the database
    // We are keeping the email of the user who created the task
    const { error } = await supabase
      .from("tasks")
      .insert({ ...newTask, email: session.user.email, image_url: imageUrl })
      .select()
      .single();
    if (error) {
      console.error("Error adding Task: ", error.message);
      return;
    }
    // if error isn't the case then we have succeeded then we set the new task to it's initial state, empty
    setNewTask({ title: "", description: "" });
  };

  // Function to delete a task
  // we are using the id of the task to delete it from the database
  // we are using the eq method to filter the task by id
  // and then we are using the delete method to delete the task
  const deleteTask = async (id: number) => {
    const { error } = await supabase.from("tasks").delete().eq("id", id);
    if (error) {
      console.error("Error deleting Task: ", error.message);
      return;
    }
    // if error isn't the case then we have succeeded then we set the new task to it's initial state, empty
    setNewTask({ title: "", description: "" });
  };

  // Function to update a task
  // we are using the id of the task to update it from the database
  // we are using the eq method to filter the task by id
  // and then we are using the update method to update the task
  // we are updating the description of the task
  // we are using the newDescription state to update the description of the task
  const updateTask = async (id: number) => {
    const { error } = await supabase
      .from("tasks")
      .update({ description: newDescription })
      .eq("id", id);
    if (error) {
      console.error("Error deleting Task: ", error.message);
      return;
    }
    // if error isn't the case then we have succeeded then we set the new task to it's initial state, empty
    setNewTask({ title: "", description: "" });
  };

  // useEffect to fetch the tasks when the component mounts
  // this will run only once when the component mounts, we are using an empty dependency array to achieve this
  useEffect(() => {
    fetchTasks();
  }, []);

  useEffect(() => {
    const channel = supabase.channel("tasks-channel");
    channel
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "tasks",
        },
        (payload) => {
          const newTask = payload.new as Task;
          setTasks((prev) => [...prev, newTask]);
        }
      )
      .subscribe((status) => {
        console.log("SUBSCRIPTION", status);
      });
  }, []);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setTaskImage(e.target.files[0]);
    }
  };

  return (
    <div className="text-white w-1/2 flex items-center justify-center flex-col gap-5">
      <h1 className="font-bold text-[1.3rem]">Task Manager CRUD</h1>
      <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
        <div className="w-full flex flex-col gap-2">
          <label htmlFor="title">Title</label>
          <input
            type="text"
            name="title"
            onChange={(e) =>
              setNewTask((prev) => ({ ...prev, title: e.target.value }))
            }
            placeholder="Task Title"
            className="bg-gray-700 p-2 w-full"
          />
        </div>
        <div className="w-full flex flex-col gap-2">
          <label htmlFor="description">Task Description</label>
          <input
            type="text"
            name="description"
            onChange={(e) =>
              setNewTask((prev) => ({ ...prev, description: e.target.value }))
            }
            placeholder="Description"
            className="bg-gray-700 p-2 w-full"
          />
        </div>

        <div>
          <input type="file" accept="image/*" onChange={handleFileChange} />
        </div>
        <div className="flex items-center justify-center">
          <button
            type="submit"
            className="bg-black w-1/2 p-2 font-bold cursor-pointer"
          >
            Add Task
          </button>
        </div>
      </form>
      {tasks.map((task, key) => (
        <section
          key={key}
          className="border-2 border-gray-500 w-full flex items-center justify-center flex-col gap-8 p-5"
        >
          <div>{task.title}</div>
          <div className="text-gray-500">{task.description}</div>
          <textarea
            placeholder="Updated Description"
            className="outline p-2"
            onChange={(e) => setNewDescription(e.target.value)}
          ></textarea>
          <div className="w-full flex items-center justify-center">
            <Image
              src={task.image_url}
              alt="Task Image"
              width={200}
              height={200}
            />
          </div>
          <div className="flex gap-5">
            <button
              className="bg-black p-2 font-bold cursor-pointer"
              onClick={() => updateTask(task.id)}
            >
              Edit
            </button>
            <button
              onClick={() => deleteTask(task.id)}
              className="bg-black p-2 font-bold cursor-pointer"
            >
              Delete
            </button>
          </div>
        </section>
      ))}
    </div>
  );
};

export default TaskManager;
