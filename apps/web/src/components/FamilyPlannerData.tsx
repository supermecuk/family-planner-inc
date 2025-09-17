"use client";

import { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import AddTaskForm from "./AddTaskForm";

interface FamilyPlannerDocument {
  id: string;
  [key: string]: any;
}

export default function FamilyPlannerData() {
  const [documents, setDocuments] = useState<FamilyPlannerDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      setError(null);

      const querySnapshot = await getDocs(
        collection(db, "family-planner_table")
      );
      const docs: FamilyPlannerDocument[] = [];

      querySnapshot.forEach((doc) => {
        docs.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      setDocuments(docs);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch documents"
      );
      console.error("Error fetching documents:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  if (loading) {
    return (
      <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg">
        <h2 className="text-lg font-semibold mb-4">Family Planner Data</h2>
        <div className="flex items-center gap-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          <span>Loading documents...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-lg">
        <h2 className="text-lg font-semibold mb-4">Family Planner Data</h2>
        <div className="text-red-600 dark:text-red-400">
          <p>Error: {error}</p>
        </div>
      </div>
    );
  }

  // Find the specific document
  const targetDocument = documents.find(
    (doc) => doc.id === "CMTes2H5wItDheC4ymtd"
  );

  return (
    <div className="space-y-6">
      <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg">
        <h2 className="text-lg font-semibold mb-4">Family Planner Data</h2>
        <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
          Found {documents.length} document(s) in family-planner_table
        </p>

        {documents.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 italic">
            No documents found in the collection.
          </p>
        ) : (
          <div className="space-y-4">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="bg-white dark:bg-gray-800 p-4 rounded border"
              >
                <h3 className="font-medium text-sm text-gray-500 dark:text-gray-400 mb-2">
                  Document ID: {doc.id}
                </h3>
                <div className="space-y-1">
                  {Object.entries(doc)
                    .filter(([key]) => key !== "id")
                    .map(([key, value]) => (
                      <div key={key} className="text-sm">
                        <span className="font-medium text-gray-700 dark:text-gray-300">
                          {key}:
                        </span>{" "}
                        <span className="text-gray-600 dark:text-gray-400">
                          {typeof value === "object"
                            ? JSON.stringify(value, null, 2)
                            : String(value)}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Task Form for the specific document */}
      {targetDocument && (
        <AddTaskForm
          documentId="CMTes2H5wItDheC4ymtd"
          onTaskAdded={fetchDocuments}
        />
      )}

      {!targetDocument && documents.length > 0 && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Document Not Found</h3>
          <p className="text-gray-600 dark:text-gray-400">
            The document with ID "CMTes2H5wItDheC4ymtd" was not found in the
            collection.
          </p>
        </div>
      )}
    </div>
  );
}
