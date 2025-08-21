import { MadeWithDyad } from "@/components/made-with-dyad";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center p-8">
        <h1 className="text-4xl font-bold mb-4 text-gray-800 dark:text-gray-200">
          مرحباً بك في نظام إدارة مكتب المحاماة
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400">
          سيتم إعداد صفحة تسجيل الدخول قريباً.
        </p>
      </div>
      <div className="absolute bottom-4">
        <MadeWithDyad />
      </div>
    </div>
  );
};

export default Index;