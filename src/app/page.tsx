export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-12 bg-background">
      <main className="flex flex-col items-center justify-center flex-1 px-4 text-center">
        <h1 className="text-6xl font-bold text-primary">
          Welcome to ApexBase
        </h1>
        <p className="mt-4 text-xl text-muted-foreground max-w-2xl">
          A powerful foundation for your next web application. Built with Next.js and Shadcn UI.
        </p>
        <div className="mt-8 grid gap-4">
          <a
            href="https://nextjs.org/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="p-6 text-left border rounded-xl hover:border-primary hover:text-primary transition-colors"
          >
            <h3 className="text-2xl font-bold">Documentation &rarr;</h3>
            <p className="mt-2 text-muted-foreground">
              Find in-depth information about Next.js features and API.
            </p>
          </a>
        </div>
      </main>
      <footer className="w-full py-8 border-t mt-auto">
        <p className="text-center text-muted-foreground">
          ApexBase © {new Date().getFullYear()}
        </p>
      </footer>
    </div>
  );
}
