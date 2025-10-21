'use client';

import { useState } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { Mic, MicOff, Save, ArrowLeft, Plus, Trash2, FileText, User, Calendar, DollarSign } from 'lucide-react';
import Link from 'next/link';
import { collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface InvoiceItem {
  description: string;
  quantity: number;
  price: number;
}

interface ParsedInvoice {
  clientName: string;
  clientEmail: string;
  items: InvoiceItem[];
  total: number;
  date: string;
  dueDate: string;
  notes: string;
}

export default function NewInvoicePage() {
  const [parsedInvoice, setParsedInvoice] = useState<ParsedInvoice>({
    clientName: '',
    clientEmail: '',
    items: [{ description: '', quantity: 1, price: 0 }],
    total: 0,
    date: '',
    dueDate: '',
    notes: '',
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

    const newItem = {
      description: descriptionMatch ? descriptionMatch[1].trim() : '',
      quantity: 1,
      price: amountMatch ? parseFloat(amountMatch[1]) : 0,
    };

    setParsedInvoice({
      clientName: clientMatch ? clientMatch[1].trim() : '',
      clientEmail: '',
      items: [newItem],
      total: newItem.price,
      date: parseDate(dateMatch ? dateMatch[1].trim() : ''),
      dueDate: parseDate(dueDateMatch ? dueDateMatch[1].trim() : ''),
      notes: '',
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

  const addItem = () => {
    setParsedInvoice(prev => ({
      ...prev,
      items: [...prev.items, { description: '', quantity: 1, price: 0 }]
    }));
  };

  const updateItem = (index: number, field: keyof InvoiceItem, value: string | number) => {
    setParsedInvoice(prev => {
      const newItems = [...prev.items];
      newItems[index] = { ...newItems[index], [field]: value };
      const total = newItems.reduce((sum, item) => sum + (item.quantity * item.price), 0);
      return { ...prev, items: newItems, total };
    });
  };

  const removeItem = (index: number) => {
    setParsedInvoice(prev => {
      const newItems = prev.items.filter((_, i) => i !== index);
      const total = newItems.reduce((sum, item) => sum + (item.quantity * item.price), 0);
      return { ...prev, items: newItems, total };
    });
  };

  const handleSave = async () => {
    try {
      // Validate required fields
      if (!parsedInvoice.clientName || parsedInvoice.items.length === 0) {
        alert('Please fill in client name and at least one item');
        return;
      }

      // Get current user (in a real app, this would come from auth)
      const userId = 'demo-user'; // Replace with actual user ID from auth

      // Check for milestone before saving
      await checkMilestone(userId);

      // Prepare invoice data
      const invoiceData = {
        client_name: parsedInvoice.clientName,
        client_email: parsedInvoice.clientEmail,
        items: parsedInvoice.items,
        total: parsedInvoice.total,
        status: 'draft',
        created_at: serverTimestamp(),
        due_date: parsedInvoice.dueDate ? new Date(parsedInvoice.dueDate) : null,
        notes: parsedInvoice.notes,
        user_id: userId,
      };

      // Save to Firebase
      const docRef = await addDoc(collection(db, 'invoices'), invoiceData);
      console.log('Invoice saved with ID:', docRef.id);

      alert('Invoice saved successfully!');
      // Reset form
      setParsedInvoice({
        clientName: '',
        clientEmail: '',
        items: [{ description: '', quantity: 1, price: 0 }],
        total: 0,
        date: '',
        dueDate: '',
        notes: '',
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
                Say something like: &quot;Create invoice for John Doe for web development services, amount 1500 dollars, due date next month&quot;
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
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <FileText className="text-primary" size={24} />
            Invoice Details
          </h2>

          <form className="space-y-6">
            {/* Client Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <User size={16} />
                  Client Name *
                </label>
                <input
                  type="text"
                  value={parsedInvoice.clientName}
                  onChange={(e) => setParsedInvoice(prev => ({ ...prev, clientName: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                  placeholder="Enter client name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <span className="text-gray-400">@</span>
                  Client Email
                </label>
                <input
                  type="email"
                  value={parsedInvoice.clientEmail}
                  onChange={(e) => setParsedInvoice(prev => ({ ...prev, clientEmail: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                  placeholder="client@example.com"
                />
              </div>
            </div>

            {/* Invoice Items */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                  <DollarSign size={16} />
                  Invoice Items *
                </label>
                <button
                  type="button"
                  onClick={addItem}
                  className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors flex items-center gap-2 text-sm"
                >
                  <Plus size={16} />
                  Add Item
                </button>
              </div>

              <div className="space-y-3">
                {parsedInvoice.items.map((item, index) => (
                  <div key={index} className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg bg-gray-50">
                    <div className="flex-1">
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => updateItem(index, 'description', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="Item description"
                      />
                    </div>
                    <div className="w-20">
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-center"
                      />
                    </div>
                    <div className="w-28">
                      <input
                        type="number"
                        step="0.01"
                        value={item.price}
                        onChange={(e) => updateItem(index, 'price', parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-right"
                        placeholder="0.00"
                      />
                    </div>
                    <div className="w-20 text-right font-semibold text-gray-900">
                      R{(item.quantity * item.price).toFixed(2)}
                    </div>
                    {parsedInvoice.items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        className="text-red-500 hover:text-red-700 p-1"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-4 p-4 bg-primary/5 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-gray-900">Total Amount:</span>
                  <span className="text-2xl font-bold text-primary">R{parsedInvoice.total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Calendar size={16} />
                  Invoice Date
                </label>
                <input
                  type="date"
                  value={parsedInvoice.date}
                  onChange={(e) => setParsedInvoice(prev => ({ ...prev, date: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Calendar size={16} />
                  Due Date
                </label>
                <input
                  type="date"
                  value={parsedInvoice.dueDate}
                  onChange={(e) => setParsedInvoice(prev => ({ ...prev, dueDate: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                />
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes
              </label>
              <textarea
                value={parsedInvoice.notes}
                onChange={(e) => setParsedInvoice(prev => ({ ...prev, notes: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                rows={3}
                placeholder="Additional notes or payment terms..."
              />
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="button"
                onClick={handleSave}
                className="bg-gradient-to-r from-primary to-primary-dark text-white px-8 py-3 rounded-lg hover:from-primary-dark hover:to-primary transition-all shadow-lg flex items-center gap-2 font-semibold"
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
