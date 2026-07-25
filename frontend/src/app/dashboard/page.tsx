export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-extrabold font-heading text-primary dark:text-cream-100 tracking-tight">
          Dashboard
        </h1>
        <p className="text-primary/70 dark:text-cream-400 font-medium">
          Selamat datang di NEMU Space Management System.
        </p>
      </div>
      
      {/* Cards or other dashboard widgets will go here */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-4">
        {[1, 2, 3, 4].map((i) => (
          <div 
            key={i} 
            className="bg-white dark:bg-[#1E2B24] p-6 rounded-2xl border border-black/5 dark:border-white/5 shadow-card-shadow hover:shadow-card-hover transition-all duration-300"
          >
            <div className="w-12 h-12 bg-primary/10 dark:bg-accent/20 rounded-xl mb-4 flex items-center justify-center">
              <div className="w-6 h-6 bg-primary/40 dark:bg-accent/40 rounded-md"></div>
            </div>
            <div className="h-4 w-1/2 bg-primary/10 dark:bg-white/10 rounded-md mb-3"></div>
            <div className="h-8 w-3/4 bg-primary/5 dark:bg-white/5 rounded-md"></div>
          </div>
        ))}
      </div>
    </div>
  );
}
