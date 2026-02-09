import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const Practice: React.FC = () => {
  const { user } = useAuth();
  const [levels, setLevels] = useState<any[]>([]);
  const [selectedLesson, setSelectedLesson] = useState<any>(null);
  const [answer, setAnswer] = useState('');
  const [result, setResult] = useState('');

  useEffect(() => {
    axios.get('/api/lessons').then(res => {
      setLevels(res.data);
    });
  }, []);

  const handleSelectLesson = (lesson: any) => {
    setSelectedLesson(lesson);
    setAnswer('');
    setResult('');
  };

  const handleSubmit = async () => {
    if (!selectedLesson) return;
    // Mock evaluation: assume correct if answer includes 'correct'
    const score = answer.toLowerCase().includes('correct') ? 100 : 40;
    const heartsLost = score >= 80 ? 0 : 1;
    try {
      const res = await axios.post('/api/progress/submit', {
        lesson_id: selectedLesson.id, // assumes lesson has id
        score,
        hearts_lost: heartsLost,
      });
      setResult(`Submitted! Score: ${score}. ${res.data.message}`);
      // Refresh user stats maybe by reloading page or context update
    } catch (err) {
      setResult('Error submitting result.');
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Practice Lessons</h1>
      <p className="mb-4">
        Logged in as <strong>{user?.username}</strong> (Level {user?.level}, Hearts: {user?.hearts}/{user?.max_hearts}, Coins: {user?.coins})
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <h2 className="text-2xl font-semibold mb-4">Levels</h2>
          {levels.map(level => (
            <div key={level.id} className="mb-6 p-4 bg-white rounded-lg shadow">
              <h3 className="text-xl font-bold">{level.title}</h3>
              <p className="text-gray-600 mb-2">{level.description}</p>
              <p className="text-sm">Required XP: {level.required_experience}</p>
              <div className="mt-3">
                <h4 className="font-semibold">Lessons:</h4>
                <div className="flex flex-wrap gap-2 mt-2">
                  {level.lessons.map((lesson: any) => (
                    <button
                      key={lesson.id}
                      className={`px-4 py-2 rounded ${selectedLesson?.id === lesson.id ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
                      onClick={() => handleSelectLesson(lesson)}
                    >
                      {lesson.order}. {lesson.title}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="md:col-span-1">
          <h2 className="text-2xl font-semibold mb-4">Lesson Details</h2>
          {selectedLesson ? (
            <div className="p-6 bg-white rounded-lg shadow">
              <h3 className="text-xl font-bold mb-2">{selectedLesson.title}</h3>
              <p className="mb-4">{selectedLesson.description}</p>
              <p className="text-sm mb-2">Type: {selectedLesson.type}</p>
              <div className="mb-4">
                <label className="block mb-2">Your answer (try typing &quot;correct&quot; for full score):</label>
                <textarea
                  className="w-full border rounded p-2"
                  rows={3}
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                />
              </div>
              <button
                className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700"
                onClick={handleSubmit}
              >
                Submit Answer
              </button>
              {result && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
                  {result}
                </div>
              )}
            </div>
          ) : (
            <p className="text-gray-500">Select a lesson to start practicing.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Practice;
