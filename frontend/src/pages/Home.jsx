import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import ItemCard from "../components/ItemCard";

function Home() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const response = await api.get("/items", { params: { limit: 6 } });
      const itemsList = Array.isArray(response.data)
        ? response.data
        : response.data?.items || [];
      setItems(itemsList.slice(0, 6));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Hero */}
      <section className="bg-blue-600 px-6 py-20 text-center text-white">
        <h1 className="mb-4 text-4xl font-bold">
          Lost & Found Campus
        </h1>

        <p className="mx-auto mb-8 max-w-2xl text-lg">
          Find what you've lost. Return what you've found.
        </p>

        <div className="flex justify-center gap-4">
          <Link
            to="/report"
            className="rounded-lg bg-white px-6 py-3 font-semibold text-blue-600"
          >
            Report Item
          </Link>

          <Link
            to="/items"
            className="rounded-lg border border-white px-6 py-3 font-semibold"
          >
            Browse Items
          </Link>
        </div>
      </section>

      {/* Recent Items */}
      <section className="mx-auto max-w-7xl px-6 py-12">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-2xl font-bold">
            Recent Reports
          </h2>

          <Link
            to="/items"
            className="text-blue-600 hover:underline"
          >
            View All
          </Link>
        </div>

        {loading ? (
          <p>Loading...</p>
        ) : items.length === 0 ? (
          <p>No items reported yet.</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <ItemCard
                key={item._id}
                item={item}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default Home;