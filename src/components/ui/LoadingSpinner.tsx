export default function LoadingSpinner() {
    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
                <div
                    className="loading-spinner"
                    style={{
                        borderColor: 'rgba(79, 70, 229, 0.3)',
                        borderTopColor: '#4f46e5',
                        width: '3rem',
                        height: '3rem',
                    }}
                ></div>
                <p className="mt-4 text-gray-600">Loading...</p>
            </div>
        </div>
    );
}
