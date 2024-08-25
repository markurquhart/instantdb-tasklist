"use client";

import { useState, useEffect } from 'react';
import { init, tx, id } from '@instantdb/react';
import { FaTrashAlt } from 'react-icons/fa'; // Icon for the remove button
import { ToastContainer, toast } from 'react-toastify'; // For toast notifications
import 'react-toastify/dist/ReactToastify.css'; // Import toast styles

// Connect to the database using environment variable
const db = init({
  appId: process.env.NEXT_PUBLIC_DB_APP_ID,
});

// Function to add a message
function addMessage(text: string) {
  db.transact(
    tx.messages[id()].update({
      text,
      createdAt: new Date(),
    })
  );
  toast.success("Task added successfully!");
}

// Function to remove a message
function removeMessage(messageId: string) {
  db.transact(
    tx.messages[messageId].delete()
  );
  toast.error("Task removed.");
}

function App() {
  const [inputValue, setInputValue] = useState("");
  const [darkMode, setDarkMode] = useState(false);

  // Toggle dark mode by adding/removing class on <html> element
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Read Data
  const { isLoading, error, data } = db.useQuery({ messages: {} });
  if (isLoading) return <div className="text-center mt-10">Fetching data...</div>;
  if (error) return <div className="text-center mt-10 text-red-500">Error fetching data: {error.message}</div>;
  const { messages } = data;

  const sortedMessages = messages.sort(
    (a, b) =>
      // @ts-expect-error
      new Date(a.createdAt) - new Date(b.createdAt)
  );

  const totalTasks = sortedMessages.length;

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-200 transition duration-500">
      <div className="max-w-lg mx-auto mt-10 p-6 bg-white dark:bg-gray-800 shadow-md rounded-lg">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold">Task Manager</h1>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="text-sm text-blue-500 hover:text-blue-700 focus:outline-none"
          >
            {darkMode ? 'Light Mode' : 'Dark Mode'}
          </button>
        </div>

        <form
          className="flex mb-4"
          onSubmit={(e: any) => {
            e.preventDefault();
            if (inputValue.trim() !== "") {
              addMessage(inputValue);
              setInputValue("");
            }
          }}
        >
          <input
            placeholder="What needs to be done?"
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="flex-grow px-4 py-2 border rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-gray-700 dark:text-gray-200"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded-r-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            Add
          </button>
        </form>

        <div className="flex justify-between items-center mb-4">
          <span className="text-gray-700 dark:text-gray-300">Total Tasks: {totalTasks}</span>
        </div>

        <ul className="space-y-2">
          {sortedMessages.map((message) => (
            <li
              key={message.id}
              className="flex justify-between items-center bg-gray-100 dark:bg-gray-700 p-3 rounded-md shadow-sm hover:shadow-md transition duration-300"
            >
              <span className="flex-grow">{message.text}</span>
              <button
                onClick={() => removeMessage(message.id)}
                className="ml-4 text-red-500 hover:text-red-700 focus:outline-none"
                title="Remove task"
              >
                <FaTrashAlt />
              </button>
            </li>
          ))}
        </ul>
      </div>
      <ToastContainer position="bottom-right" autoClose={3000} />
    </div>
  );
}

export default App;
