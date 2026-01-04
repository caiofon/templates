import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SetupGuides from "./examples/SetupGuides";
import VersionsGuide from "./examples/VersionsGuide";
import CommandsReference from "./examples/CommandsReference";
import SQLBestPractices from "./examples/SQLBestPractices";
import FrontendExamples from "./examples/FrontendExamples";

const ToolsSection = () => {
  return (
    <section id="tools" className="py-20 px-4">
      <div className="container max-w-6xl">
        <div className="space-y-4 mb-12">
          <h2 className="text-3xl font-bold font-mono">
            <span className="text-primary">#</span> Tools & References
          </h2>
          <p className="text-muted-foreground max-w-2xl">
            Setup de IDEs, versões de linguagens, comandos essenciais, frontend frameworks e boas práticas SQL.
          </p>
        </div>

        <Tabs defaultValue="setup" className="w-full">
          <TabsList className="bg-secondary border border-border mb-6 flex-wrap h-auto gap-1">
            <TabsTrigger 
              value="setup" 
              className="font-mono text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              IDE Setup
            </TabsTrigger>
            <TabsTrigger 
              value="versions" 
              className="font-mono text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Versões Java/Node
            </TabsTrigger>
            <TabsTrigger 
              value="commands" 
              className="font-mono text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Linux/Git/SVN
            </TabsTrigger>
            <TabsTrigger 
              value="frontend" 
              className="font-mono text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              React/Angular
            </TabsTrigger>
            <TabsTrigger 
              value="sql" 
              className="font-mono text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              SQL Performance
            </TabsTrigger>
          </TabsList>

          <TabsContent value="setup">
            <SetupGuides />
          </TabsContent>

          <TabsContent value="versions">
            <VersionsGuide />
          </TabsContent>

          <TabsContent value="commands">
            <CommandsReference />
          </TabsContent>

          <TabsContent value="frontend">
            <FrontendExamples />
          </TabsContent>

          <TabsContent value="sql">
            <SQLBestPractices />
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
};

export default ToolsSection;
