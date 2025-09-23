import { useNavigate } from "react-router-dom";

export default function TaxCalendar() {
  const navigate = useNavigate();

  const events = [
    {
      id: 1,
      title: "Reminder : Q2 Estimated Tax Payment",
      date: "July 1, 2025",
      description:
        "Reminder for updating Q2 estimated tax payment due on July 20, 2025",
      type: "reminder",
      month: "July, 2025",
    },
    {
      id: 2,
      title: "Q2 Estimated Tax Payment",
      date: "July 20, 2025",
      description: "Q2 estimated tax payment due",
      type: "payment",
      month: "July, 2025",
    },
    {
      id: 3,
      title: "Reminder : Q3 Estimated Tax Payment",
      date: "September 1, 2025",
      description:
        "Reminder for updating Q3 estimated tax payment due on September 20, 2025",
      type: "reminder",
      month: "September, 2025",
    },
  ];

  // group events by month
  const grouped = events.reduce((acc, ev) => {
    if (!acc[ev.month]) acc[ev.month] = [];
    acc[ev.month].push(ev);
    return acc;
  }, {});

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-5xl mx-auto px-6 py-6">
        <div className="bg-white shadow rounded-2xl p-6">
          {/* Header */}
          <div className="flex justify-between items-center border-b pb-2 mb-4">
            <h1 className="text-xl font-semibold text-gray-800">Tax Calendar</h1>
            <button
              onClick={() => navigate("/dashboard")}
              className="text-gray-500 hover:text-black text-xl font-bold"
            >
              ✕
            </button>
          </div>

          {/* Events grouped by month */}
          <div className="space-y-6">
            {Object.keys(grouped).map((month) => (
              <div key={month}>
                <h2 className="text-gray-600 font-medium mb-3">{month}</h2>
                <div className="space-y-4">
                  {grouped[month].map((ev) => (
                    <div
                      key={ev.id}
                      className="shadow-md rounded-lg border p-4 flex justify-between items-center"
                    >
                      <div>
                        <h3 className="font-semibold text-gray-800">{ev.title}</h3>
                        <p className="text-sm text-gray-500">{ev.date}</p>
                        <p className="text-sm text-gray-600">{ev.description}</p>
                      </div>
                      {ev.type === "reminder" ? (
                        <span className="border-2 border-blue-500 text-blue-600 px-3 py-1 rounded-full text-sm font-semibold bg-white">
                          Reminder
                        </span>
                      ) : (
                        <span className="border-2 border-green-500 text-green-600 px-3 py-1 rounded-full text-sm font-semibold bg-white">
                          Payment
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
