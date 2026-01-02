import { motion } from 'framer-motion';

export const SkeletonLoader = ({ 
  className = '', 
  variant = 'default' 
}: { 
  className?: string; 
  variant?: 'default' | 'circle' | 'text' 
}) => {
  const variants = {
    default: 'h-4 w-full',
    circle: 'h-12 w-12 rounded-full',
    text: 'h-4 w-3/4'
  };

  return (
    <motion.div
      className={`bg-gray-200 rounded-lg ${variants[variant]} ${className}`}
      animate={{ opacity: [0.5, 1, 0.5] }}
      transition={{ duration: 1.5, repeat: Infinity }}
    />
  );
};

export const ProfileSkeleton = () => (
  <div className="max-w-lg mx-auto px-4 py-6 space-y-4">
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <div className="flex gap-4 items-center">
        <SkeletonLoader variant="circle" className="w-16 h-16" />
        <div className="flex-1 space-y-2">
          <SkeletonLoader className="h-6 w-32" />
          <SkeletonLoader className="h-4 w-24" />
          <SkeletonLoader className="h-4 w-48" />
        </div>
      </div>
      <div className="mt-4 space-y-3">
        <SkeletonLoader className="h-10 w-full" />
        <SkeletonLoader className="h-10 w-full" />
      </div>
    </div>
    
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <SkeletonLoader className="h-5 w-32 mb-4" />
      <div className="space-y-3">
        <SkeletonLoader className="h-4 w-full" />
        <SkeletonLoader className="h-4 w-5/6" />
        <SkeletonLoader className="h-4 w-4/6" />
      </div>
    </div>
  </div>
);

export const DonorCardSkeleton = () => (
  <div className="bg-white rounded-2xl p-4 shadow-sm">
    <div className="flex gap-4">
      <SkeletonLoader variant="circle" className="w-12 h-12" />
      <div className="flex-1 space-y-2">
        <SkeletonLoader className="h-5 w-32" />
        <div className="flex gap-2">
          <SkeletonLoader className="h-6 w-12" />
          <SkeletonLoader className="h-4 w-24" />
        </div>
        <div className="flex gap-2">
          <SkeletonLoader className="h-8 w-20" />
          <SkeletonLoader className="h-8 w-20" />
        </div>
      </div>
    </div>
  </div>
);

export const ButtonLoader = ({ text = 'Loading...' }: { text?: string }) => (
  <div className="flex items-center justify-center gap-2">
    <motion.div
      className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
    />
    <span>{text}</span>
  </div>
);

export const PageLoader = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="text-center">
      <motion.div
        className="w-16 h-16 bg-red-500 rounded-full mx-auto mb-4"
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 1, repeat: Infinity }}
      >
        <div className="w-full h-full rounded-full border-4 border-red-100 border-t-transparent animate-spin" />
      </motion.div>
      <p className="text-gray-500">Loading...</p>
    </div>
  </div>
);

export const EmptyState = ({ 
  icon, 
  title, 
  description, 
  action 
}: { 
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}) => (
  <div className="text-center py-12">
    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
      {icon}
    </div>
    <h3 className="text-lg font-semibold text-gray-800 mb-2">{title}</h3>
    <p className="text-gray-500 text-sm mb-6">{description}</p>
    {action && <div>{action}</div>}
  </div>
);
