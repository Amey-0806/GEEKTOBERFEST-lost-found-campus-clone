import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import api from "../services/api";
import { useAuth } from "../context/AuthContext";

function Dashboard() {
  const { user } = useAuth();

  const [items, setItems] = useState([]);

  useEffect(() => {
    fetchMyItems();
  }, []);

  const fetchMyItems = async () => {
    try {
      const response = await api.get("/items", { params: { limit: 100 } });
      const itemsList = Array.isArray(response.data)
        ? response.data
        : response.data?.items || [];

      const myItems = itemsList.filter(
        (item) =>
          item.reportedBy?._id === user?.id
      );

      setItems(myItems);
    } catch (error) {
      console.error(error);
    }
  };

  const active = items.filter(
    (item) => item.status === "active"
  ).length;

  const claimed = items.filter(
    (item) => item.status === "claimed"
  ).length;

  const recovered = items.filter(
    (item) => item.status === "recovered"
  ).length;

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <h1 className="mb-2 text-3xl font-bold">
        Welcome, {user?.name}
      </h1>

      <p className="mb-8 text-gray-500">
        Manage your lost and found reports.
      </p>

      {/* Stats */}
      <div className="mb-10 grid gap-5 md:grid-cols-4">
        <div className="rounded-xl border bg-white p-6">
          <p className="text-gray-500">
            Total Reports
          </p>

          <p className="mt-2 text-3xl font-bold">
            {items.length}
          </p>
        </div>

        <div className="rounded-xl border bg-white p-6">
          <p className="text-gray-500">
            Active
          </p>

          <p className="mt-2 text-3xl font-bold">
            {active}
          </p>
        </div>

        <div className="rounded-xl border bg-white p-6">
          <p className="text-gray-500">
            Claimed
          </p>

          <p className="mt-2 text-3xl font-bold">
            {claimed}
          </p>
        </div>

        <div className="rounded-xl border bg-white p-6">
          <p className="text-gray-500">
            Recovered
          </p>

          <p className="mt-2 text-3xl font-bold">
            {recovered}
          </p>
        </div>
      </div>

      {/* Reports */}
      <h2 className="mb-5 text-2xl font-bold">
        My Reports
      </h2>

      {items.length === 0 ? (
        <div className="rounded-lg bg-gray-100 p-10 text-center">
          <p className="mb-4">
            You haven't reported any items yet.
          </p>

          <Link
            to="/report"
            className="rounded-lg bg-blue-600 px-5 py-2 text-white"
          >
            Report Item
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-4 text-left">
                  Item
                </th>

                <th className="p-4 text-left">
                  Type
                </th>

                <th className="p-4 text-left">
                  Status
                </th>

                <th className="p-4 text-left">
                  Action
                </th>
              </tr>
            </thead>

            <tbody>
              {items.map((item) => (
                <tr
                  key={item._id}
                  className="border-t"
                >
                  <td className="p-4">
                    {item.title}
                  </td>

                  <td className="p-4">
                    {item.type}
                  </td>

                  <td className="p-4">
                    {item.status}
                  </td>

                  <td className="p-4">
                    <Link
                      to={`/items/${item._id}`}
                      className="text-blue-600 hover:underline"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Dashboard;