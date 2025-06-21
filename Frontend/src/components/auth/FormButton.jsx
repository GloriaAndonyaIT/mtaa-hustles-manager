const FormButton = ({ 
  children, 
  type = 'button', 
  isLoading = false, 
  disabled = false,
  className = '',
  ...props 
}) => {
  return (
    <button 
      type={type}
      disabled={disabled || isLoading}
      className={`w-full bg-teal-600 hover:bg-teal-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-3 px-4 rounded-lg font-medium transition-colors duration-200 shadow-sm hover:shadow-md ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default FormButton;