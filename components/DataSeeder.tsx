import React, { useState } from 'react';
import { seedDatabase } from '../api';
import DatabaseIcon from './icons/DatabaseIcon';

interface DataSeederProps {
    addToast: (message: string, type: 'success' | 'error') => void;
}

const DataSeeder: React.FC<DataSeederProps> = ({ addToast }) => {
    const [isSeeding, setIsSeeding] = useState(false);

    const handleSeed = async () => {
        const confirmed = window.confirm(
            "Are you sure you want to seed the database? This will overwrite existing sample data for your user account. This should only be done once on a fresh database."
        );

        if (confirmed) {
            setIsSeeding(true);
            try {
                await seedDatabase();
                addToast('Database seeded successfully!', 'success');
            } catch (error: any) {
                console.error("Seeding failed", error);
                addToast(error.message || 'Database seeding failed.', 'error');
            } finally {
                setIsSeeding(false);
            }
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-md">
            <div className="p-6 border-b border-gray-200">
                <h3 className="text-xl font-semibold text-gray-800 flex items-center">
                    <DatabaseIcon />
                    <span className="ml-2">Developer Tools</span>
                </h3>
            </div>
            <div className="p-6">
                <p className="text-sm text-gray-600 mb-4">
                    If this is your first time setting up the application with a new database,
                    use this tool to populate it with the initial sample data.
                </p>
                <button
                    onClick={handleSeed}
                    disabled={isSeeding}
                    className="w-full px-6 py-3 bg-amber-500 text-white font-semibold rounded-lg shadow-md hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-opacity-75 transition-colors disabled:bg-amber-300 disabled:cursor-wait flex items-center justify-center"
                >
                    {isSeeding && <div className="animate-spin h-5 w-5 mr-3 border-2 border-white border-t-transparent rounded-full"></div>}
                    {isSeeding ? 'Seeding...' : 'Seed Database'}
                </button>
            </div>
        </div>
    );
};

export default DataSeeder;