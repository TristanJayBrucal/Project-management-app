import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { TASK_STATUS_CLASS_MAP, TASK_STATUS_TEXT_MAP } from "@/constants";
import { Head, Link } from "@inertiajs/react";
import { CircularProgressbar, buildStyles, } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import dayjs from "dayjs";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";


function getTaskStatus(task) {
  if (task.status !== 'completed' && dayjs(task.due_date).isBefore(dayjs(), 'day')) {
    return 'overdue';
  }
  return task.status;
}
const COLORS = ["#ef4444", "#f97316", "#eab308", "#10b981", "#3b82f6"];

export default function Dashboard({
  auth,
  totalPendingTasks,
  myPendingTasks,
  totalProgressTasks,
  myProgressTasks,
  totalCompletedTasks,
  myCompletedTasks,
  activeTasks,
  completionRate,
  userProductivity,
  overdueTasks,
}) {
  return (
    <AuthenticatedLayout
      user={auth.user}
      header={
        <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
          Dashboard
        </h2>
      }
    >
      <Head title="Dashboard" />

      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-gray-800 p-6 shadow-sm rounded-lg text-center">
            <h3 className="text-green-500 text-lg font-semibold mb-3">
              Task Completion Rate
            </h3>
            <div className="w-24 mx-auto">
              <CircularProgressbar
                value={completionRate}
                text={`${completionRate}%`}
                styles={buildStyles({
                  pathColor: "#10b981",
                  textColor: "#10b981",
                  trailColor: "#d1d5db",
                })}
              />
            </div>
          </div>

          {/* User Productivity Bar Chart */}
          <div className="bg-white dark:bg-gray-800 p-6 shadow-sm rounded-lg">
            <h3 className="text-blue-400 text-lg font-semibold mb-3">
              User Productivity (This Month)
            </h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={userProductivity}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="completed" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Overdue Tasks Pie Chart */}
          <div className="bg-white dark:bg-gray-800 p-6 shadow-sm rounded-lg">
            <h3 className="text-red-400 text-lg font-semibold mb-3">
              Overdue Tasks
            </h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={overdueTasks}
                  dataKey="overdue"
                  nameKey="user"
                  cx="50%"
                  cy="50%"
                  outerRadius={60}
                  label
                >
                  {overdueTasks.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* My Active Tasks Table */}
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 mt-8">
          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
            <div className="p-6 text-gray-900 dark:text-gray-100">
              <h3 className="text-gray-200 text-xl font-semibold">
                My Active Tasks
              </h3>
              <table className="mt-3 w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400 border-b-2 border-gray-500">
                  <tr>
                    <th className="px-3 py-3">ID</th>
                    <th className="px-3 py-3">Project Name</th>
                    <th className="px-3 py-3">Name</th>
                    <th className="px-3 py-3">Status</th>
                    <th className="px-3 py-3">Due Date</th>
                  </tr>
                </thead>
                <tbody>
                  {activeTasks.data.map((task) => (
                    <tr key={task.id}>
                      <td className="px-3 py-2">{task.id}</td>
                      <td className="px-3 py-2 text-white hover:underline">
                        <Link href={route("project.show", task.project.id)}>
                          {task.project.name}
                        </Link>
                      </td>
                      <td className="px-3 py-2 text-white hover:underline">
                        <Link href={route("task.show", task.id)}>
                          {task.name}
                        </Link>
                      </td>
                      <td className="px-3 py-2">
                      <span
                        className={ "px-2 py-1 rounded text-nowrap text-white " +
                          TASK_STATUS_CLASS_MAP[getTaskStatus(task)]
                        }
                      >
                        {TASK_STATUS_TEXT_MAP[getTaskStatus(task)]}
                      </span>
                      </td>
                      <td className="px-3 py-2 text-nowrap">{task.due_date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
