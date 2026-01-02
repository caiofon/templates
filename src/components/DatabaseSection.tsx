import DatabaseExamples from "./examples/DatabaseExamples";

const DatabaseSection = () => {
  return (
    <section id="database" className="py-20 px-4 bg-secondary/30">
      <div className="container max-w-6xl">
        <div className="space-y-4 mb-12">
          <h2 className="text-3xl font-bold font-mono">
            <span className="text-primary">#</span> Database & PL/SQL
          </h2>
          <p className="text-muted-foreground max-w-2xl">
            Oracle and PostgreSQL patterns: Collections, DDL, Security, RLS, and User Administration.
          </p>
        </div>

        <DatabaseExamples />
      </div>
    </section>
  );
};

export default DatabaseSection;
