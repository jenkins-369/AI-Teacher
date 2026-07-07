"use client";

import { useState, useEffect } from "react";
import {
  Card,
  Button,
  Input,
  LoadingSpinner,
  Alert,
  Modal,
} from "@/components/ui";
import {
  studyMaterialsApi,
  documentChunksApi,
  generateApi,
} from "@/services/api";

export default function StudyMaterialManager({ courseId, fetchCourse }) {
  const [materials, setMaterials] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [showBulkChunks, setShowBulkChunks] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState(null);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    file_type: "pdf",
    pages: "",
  });
  const [chunkData, setChunkData] = useState({ text: "", page_number: "" });
  const [chunks, setChunks] = useState({});
  const [editingChunkId, setEditingChunkId] = useState(null);
  const [editingChunkText, setEditingChunkText] = useState("");
  const [editingChunkPage, setEditingChunkPage] = useState("");
  const [generating, setGenerating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchMaterials = async () => {
    try {
      const data = await studyMaterialsApi.getAll();
      setMaterials(data.filter((m) => m.course_id === parseInt(courseId)));

      const chunkPromises = data
        .filter((m) => m.course_id === parseInt(courseId))
        .map((m) => documentChunksApi.getAll(m.id));
      const chunkResults = await Promise.all(chunkPromises);
      const chunkMap = {};
      data
        .filter((m) => m.course_id === parseInt(courseId))
        .forEach((m, idx) => {
          chunkMap[m.id] = chunkResults[idx];
        });
      setChunks(chunkMap);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaterials();
  }, [courseId]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await studyMaterialsApi.create({
        course_id: parseInt(courseId),
        title: formData.title,
        file_type: formData.file_type,
        pages: formData.pages ? parseInt(formData.pages) : null,
      });
      setShowForm(false);
      setFormData({ title: "", file_type: "pdf", pages: "" });
      fetchMaterials();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await studyMaterialsApi.update(editingMaterial.id, {
        title: formData.title,
        file_type: formData.file_type,
        pages: formData.pages ? parseInt(formData.pages) : null,
      });
      setShowForm(false);
      setEditingMaterial(null);
      setFormData({ title: "", file_type: "pdf", pages: "" });
      fetchMaterials();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this study material?")) return;
    try {
      await studyMaterialsApi.delete(id);
      fetchMaterials();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleAddBulkChunks = async (e) => {
    e.preventDefault();
    if (!selectedMaterial) return;
    try {
      const chunks = chunkData.text.split("\n\n").map((text, index) => ({
        text,
        page_number: chunkData.page_number
          ? parseInt(chunkData.page_number)
          : index + 1,
      }));
      await documentChunksApi.create({
        material_id: selectedMaterial.id,
        chunks,
      });
      setShowBulkChunks(false);
      setChunkData({ text: "", page_number: "" });
      fetchMaterials();
    } catch (err) {
      setError(err.message);
    }
  };

  const fetchChunks = async (materialId) => {
    try {
      const data = await documentChunksApi.getAll(materialId);
      setChunks((prev) => ({ ...prev, [materialId]: data }));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleAddSingleChunk = async (e) => {
    e.preventDefault();
    if (!selectedMaterial || !singleChunk.text.trim()) return;
    try {
      await documentChunksApi.create({
        material_id: selectedMaterial.id,
        chunks: [
          {
            text: singleChunk.text,
            page_number: singleChunk.page_number
              ? parseInt(singleChunk.page_number)
              : 1,
          },
        ],
      });
      setSingleChunk({ text: "", page_number: "" });
      fetchChunks(selectedMaterial.id);
      fetchMaterials();
    } catch (err) {
      setError(err.message);
    }
  };

  const startInlineEdit = (chunk) => {
    setEditingChunkId(chunk.id);
    setEditingChunkText(chunk.chunk_text || "");
    setEditingChunkPage(chunk.page_number?.toString() || "1");
  };

  const cancelInlineEdit = () => {
    setEditingChunkId(null);
    setEditingChunkText("");
    setEditingChunkPage("");
  };

  const saveInlineEdit = async (materialId, chunkId) => {
    try {
      await documentChunksApi.update(chunkId, {
        chunk_text: editingChunkText,
        page_number: editingChunkPage ? parseInt(editingChunkPage) : undefined,
      });
      cancelInlineEdit();
      fetchChunks(materialId);
      fetchMaterials();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteChunk = async (materialId, id) => {
    if (!confirm("Delete this chunk?")) return;
    try {
      await documentChunksApi.delete(id);
      fetchChunks(materialId);
      fetchMaterials();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleGenerate = async (materialId, type) => {
    setGenerating(true);
    try {
      if (type === "summary") {
        await generateApi.summary(materialId);
      } else if (type === "flashcards") {
        await generateApi.flashcards(materialId, 4);
      } else if (type === "quiz") {
        await generateApi.quiz(materialId, 5);
      } else if (type === "assignment") {
        await generateApi.assignment(materialId, 3);
      }
      fetchMaterials();
      fetchCourse(courseId);
    } catch (err) {
      setError("Please add document chunks first.");
    } finally {
      setGenerating(false);
    }
  };

  const openEditForm = (material) => {
    setEditingMaterial(material);
    setFormData({
      title: material.title,
      file_type: material.file_type || "pdf",
      pages: material.pages?.toString() || "",
    });
    setShowForm(true);
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Study Materials</h3>
        <Button
          onClick={() => {
            setEditingMaterial(null);
            setFormData({ title: "", file_type: "pdf", pages: "" });
            setShowForm(true);
          }}
        >
          Add Material
        </Button>
      </div>

      {error && (
        <Alert message={error} type="error" onClose={() => setError("")} />
      )}

      <div className="space-y-4">
        {materials.map((material) => {
          const materialChunks = chunks[material.id] || [];
          return (
            <Card key={material.id}>
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium">{material.title}</h4>
                  <p className="text-sm text-gray-500">
                    {material.file_type} • {material.pages} pages
                  </p>
                  <div className="mt-2 space-x-2">
                    <Button
                      variant="secondary"
                      onClick={() => handleGenerate(material.id, "summary")}
                      disabled={generating}
                    >
                      Generate Summary
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => handleGenerate(material.id, "flashcards")}
                      disabled={generating}
                    >
                      Generate Flashcards
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => handleGenerate(material.id, "quiz")}
                      disabled={generating}
                    >
                      Generate Quiz
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => handleGenerate(material.id, "assignment")}
                      disabled={generating}
                    >
                      Generate Assignment
                    </Button>
                    <Button
                      variant={error ? "info" : "secondary"}
                      onClick={() => {
                        setSelectedMaterial(material);
                        setShowBulkChunks(true);
                      }}
                    >
                      Add Chunks
                    </Button>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    onClick={() => openEditForm(material)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => handleDelete(material.id)}
                  >
                    Delete
                  </Button>
                </div>
              </div>

              <div className="mt-4">
                <h5 className="text-sm font-semibold mb-2">
                  Document Chunks ({materialChunks.length})
                </h5>
                {materialChunks.length === 0 ? (
                  <p className="text-sm text-gray-500">
                    No chunks yet. Click &quot;Add Chunks&quot; to add content.
                  </p>
                ) : (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {materialChunks.map((chunk) => (
                      <div key={chunk.id} className="p-3 bg-gray-50 rounded-lg">
                        {editingChunkId === chunk.id ? (
                          <form
                            onSubmit={(e) => {
                              e.preventDefault();
                              saveInlineEdit(material.id, chunk.id);
                            }}
                            className="space-y-2"
                          >
                            <textarea
                              value={editingChunkText}
                              onChange={(e) =>
                                setEditingChunkText(e.target.value)
                              }
                              rows={3}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              required
                            />
                            <Input
                              label="Page Number"
                              type="number"
                              value={editingChunkPage}
                              onChange={(e) =>
                                setEditingChunkPage(e.target.value)
                              }
                            />
                            <div className="flex gap-2">
                              <Button type="submit" size="sm">
                                Save
                              </Button>
                              <Button
                                variant="secondary"
                                type="button"
                                size="sm"
                                onClick={cancelInlineEdit}
                              >
                                Cancel
                              </Button>
                            </div>
                          </form>
                        ) : (
                          <>
                            <p className="text-sm text-gray-700 whitespace-pre-wrap line-clamp-3">
                              {chunk.chunk_text}
                            </p>
                            <div className="flex justify-between items-center mt-2">
                              <p className="text-xs text-gray-500">
                                Page: {chunk.page_number}
                              </p>
                              <div className="flex gap-2">
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  onClick={() => startInlineEdit(chunk)}
                                >
                                  Edit
                                </Button>
                                <Button
                                  variant="danger"
                                  size="sm"
                                  onClick={() =>
                                    handleDeleteChunk(material.id, chunk.id)
                                  }
                                >
                                  Delete
                                </Button>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {showForm && (
        <Modal
          isOpen={showForm}
          title={editingMaterial ? "Edit Study Material" : "Add Study Material"}
          onClose={() => {
            setShowForm(false);
            setEditingMaterial(null);
          }}
        >
          <form onSubmit={editingMaterial ? handleUpdate : handleCreate}>
            <Input
              label="Title"
              value={formData.title}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, title: e.target.value }))
              }
              required
            />
            <Input
              label="File Type"
              value={formData.file_type}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, file_type: e.target.value }))
              }
            />
            <Input
              label="Pages"
              type="number"
              value={formData.pages}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, pages: e.target.value }))
              }
            />
            <div className="flex gap-2 mt-4">
              <Button type="submit">
                {editingMaterial ? "Update" : "Create"}
              </Button>
              <Button
                variant="secondary"
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingMaterial(null);
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {showBulkChunks && (
        <Modal
          title={`Add Chunks - ${selectedMaterial?.title || ""}`}
          onClose={() => {
            setShowBulkChunks(false);
            setSelectedMaterial(null);
            setChunkData({ text: "", page_number: "" });
          }}
        >
          <form onSubmit={handleAddBulkChunks}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Material
              </label>
              <p className="text-sm text-gray-600">{selectedMaterial?.title}</p>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Chunks (separate with double newlines)
              </label>
              <textarea
                value={chunkData.text}
                onChange={(e) =>
                  setChunkData((prev) => ({ ...prev, text: e.target.value }))
                }
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Chunk 1 text..."
                required
              />
            </div>
            <Input
              label="Starting Page Number"
              type="number"
              value={chunkData.page_number}
              onChange={(e) =>
                setChunkData((prev) => ({
                  ...prev,
                  page_number: e.target.value,
                }))
              }
            />
            <div className="flex gap-2 mt-4">
              <Button type="submit">Add Chunks</Button>
              <Button
                variant="secondary"
                type="button"
                onClick={() => {
                  setShowBulkChunks(false);
                  setSelectedMaterial(null);
                  setChunkData({ text: "", page_number: "" });
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
