'use client';

import { useState } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { Mic, MicOff, Save, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface ParsedInvoice {
  clientName: string;
  description: string;
  amount: string;
  date: string;
  dueDate: string;
}

export default function NewInvoicePage() {
  const [parsedInvoice, setParsedInvoice] = useState<ParsedInvoice>({
    clientName: '',
    description: '',
    amount: '',
    date: '',
    dueDate: '',
  });

  const [isListening, setIsListening] = useState(false);

  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition
  } = useSpeechRecognition();

  const startListening = () => {
    setIsListening(true);
    SpeechRecognition.startListening({ continuous: true });
  };

  const stopListening = () => {
    setIsListening(false);
    SpeechRecognition.stopListening();
    parseTranscript(transcript);
  };

  const parseTranscript = (text: string) => {
    const lowerText = text.toLowerCase();

    // Enhanced parsing logic for invoice fields
    const clientMatch = lowerText.match(/(?:client|customer)\s+(?:name\s+)?(?:is\s+)?([a-zA-Z\s]+?)(?:\s+for|\s+amount|\s+dollar|\$|$)/i);
    const amountMatch = lowerText.match(/(?:amount|total|price|cost)\s+(?:of\s+)?\$?(\d+(?:\.\d{2})?)/i) ||
                        lowerText.match(/\$(\d+(?:\.\d{2})?)/);
    const descriptionMatch = lowerText.match(/(?:for\s+)(.+?)(?:\s+amount|\s+dollar|\s+\$|\s+due|\s+date|$)/i);
    const dateMatch = lowerText.match(/(?:date|invoice date)\s+(?:is\s+)?([a-zA-Z0-9\s]+?)(?:\s+due|\s+amount|$)/i);
    const dueDateMatch = lowerText.match(/(?:due\s+date|due|payment due)\s+(?:is\s+|on\s+)?([a-zA-Z0-9\s]+?)(?:\s+for|\s+amount|$)/i);

    // Parse dates more intelligently
    const parseDate = (dateStr: string) => {
      if (!dateStr) return '';
      const today = new Date();
      const lowerDate = dateStr.toLowerCase().trim();

      if (lowerDate.includes('today')) return today.toISOString().split('T')[0];
      if (lowerDate.includes('tomorrow')) {
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        return tomorrow.toISOString().split('T')[0];
      }
      if (lowerDate.includes('next week')) {
        const nextWeek = new Date(today);
        nextWeek.setDate(today.getDate() + 7);
        return nextWeek.toISOString().split('T')[0];
      }
      if (lowerDate.includes('next month')) {
        const nextMonth = new Date(today);
        nextMonth.setMonth(today.getMonth() + 1);
        return nextMonth.toISOString().split('T')[0];
      }

      // Try to parse as a date
      const parsed = new Date(dateStr);
      if (!isNaN(parsed.getTime())) {
        return parsed.toISOString().split('T')[0];
      }

      return dateStr; // fallback to original string
    };

    setParsedInvoice({
      clientName: clientMatch ? clientMatch[1].trim() : '',
      description: descriptionMatch ? descriptionMatch[1].trim() : '',
      amount: amountMatch ? amountMatch[1] : '',
      date: parseDate(dateMatch ? dateMatch[1].trim() : ''),
      dueDate: parseDate(dueDateMatch ? dueDateMatch[1].trim() : ''),
    });
  };

  const checkMilestone = async (userId: string) => {
    try {
      // Get current invoice count
      const invoicesRef = collection(db, 'invoices');
      const q = query(invoicesRef, where('user_id', '==', userId));
      const querySnapshot = await getDocs(q);
      const currentCount = querySnapshot.size;

      // Check if this invoice triggers a milestone
      const milestones = [1, 5, 10, 25, 50, 100];
      const newCount = currentCount + 1;

      if (milestones.includes(newCount)) {
        // Get business name from user settings (assuming it's stored in user profile)
        const userDoc = await getDocs(query(collection(db, 'users'), where('id', '==', userId)));
        let businessName = 'Smart Invoice';
        if (!userDoc.empty) {
          const userData = userDoc.docs[0].data();
          businessName = userData.businessName || userData.name || 'Smart Invoice';
        }

        // Generate social post
        const response = await fetch('/api/social-post', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ milestone: newCount, businessName }),
        });

        if (response.ok) {
          const postData = await response.json();
          // Store the generated post for later sharing
          localStorage.setItem('pendingSocialPost', JSON.stringify(postData));
          // Show notification to user
          alert(`🎉 Milestone reached! ${newCount} invoices created. Check your dashboard for a social media post to share!`);
        }
      }
    } catch (error) {
      console.error('Error checking milestone:', error);
    }
  };

  const handleSave = async () => {
    try {
      // Validate required fields
      if (!parsedInvoice.clientName || !parsedInvoice.amount) {
        alert('Please fill in at least client name and amount');
        return;
      }

      // Get current user (in a real app, this would come from auth)
      const userId = 'demo-user'; // Replace with actual user ID from auth

      // Check for milestone before saving
      await checkMilestone(userId);

      // Prepare invoice data
      const invoiceData = {
        client_name: parsedInvoice.clientName,
        client_email: '', // Can be added later
        items: [{
          description: parsedInvoice.description || 'Services',
          quantity: 1,
          price: parseFloat(parsedInvoice.amount),
        }],
        total: parseFloat(parsedInvoice.amount),
        status: 'draft',
        created_at: serverTimestamp(),
        due_date: parsedInvoice.dueDate ? new Date(parsedInvoice.dueDate) : null,
        user_id: userId,
      };

      // Save to Firebase
      const docRef = await addDoc(collection(db, 'invoices'), invoiceData);
      console.log('Invoice saved with ID:', docRef.id);

      alert('Invoice saved successfully!');
      // Reset form
      setParsedInvoice({
        clientName: '',
        description: '',
        amount: '',
        date: '',
        dueDate: '',
      });
      resetTranscript();
    } catch (error) {
      console.error('Error saving invoice:', error);
      alert('Error saving invoice. Please try again.');
    }
  };

  if (!browserSupportsSpeechRecognition) {
    return (
      <div className="min-h-screen bg-primary/5 p-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">Speech recognition is not supported in this browser.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center text-primary hover:text-primary-dark mb-4"
          >
            <ArrowLeft size={20} className="mr-2" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Create New Invoice</h1>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Voice Input</h2>
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={isListening ? stopListening : startListening}
              className={`p-4 rounded-full ${
                isListening
                  ? 'bg-accent hover:bg-accent-dark text-white'
                  : 'bg-primary hover:bg-primary-dark text-white'
              } transition-colors`}
            >
              {isListening ? <MicOff size={24} /> : <Mic size={24} />}
            </button>
            <div>
              <p className="font-medium">
                {isListening ? 'Listening...' : 'Click to start recording'}
              </p>
              <p className="text-sm text-gray-600">
                Say something like: "Create invoice for John Doe for web development services, amount 1500 dollars, due date next month"
              </p>
            </div>
          </div>

          {transcript && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium mb-2">Transcript:</h3>
              <p className="text-gray-700">{transcript}</p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-semibold mb-4">Invoice Details</h2>
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Client Name
              </label>
              <input
                type="text"
                value={parsedInvoice.clientName}
                onChange={(e) => setParsedInvoice(prev => ({ ...prev, clientName: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Enter client name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={parsedInvoice.description}
                onChange={(e) => setParsedInvoice(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                rows={3}
                placeholder="Enter invoice description"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount (R)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={parsedInvoice.amount}
                  onChange={(e) => setParsedInvoice(prev => ({ ...prev, amount: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={parsedInvoice.date}
                  onChange={(e) => setParsedInvoice(prev => ({ ...prev, date: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Due Date
                </label>
                <input
                  type="date"
                  value={parsedInvoice.dueDate}
                  onChange={(e) => setParsedInvoice(prev => ({ ...prev, dueDate: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleSave}
                className="bg-secondary text-white px-6 py-2 rounded-lg hover:bg-accent transition-colors flex items-center gap-2"
              >
                <Save size={20} />
                Save Invoice
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}