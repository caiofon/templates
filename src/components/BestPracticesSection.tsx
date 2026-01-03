import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import JavaExamples from "./examples/JavaExamples";
import NodeExamples from "./examples/NodeExamples";
import SOLIDPrinciples from "./examples/SOLIDPrinciples";

const BestPracticesSection = () => {
  return (
    <section id="best-practices" className="py-20 px-4 bg-secondary/30">
      <div className="container max-w-6xl">
        <div className="space-y-4 mb-12">
          <h2 className="text-3xl font-bold font-mono">
            <span className="text-primary">#</span> Best Practices & Templates
          </h2>
          <p className="text-muted-foreground max-w-2xl">
            Production-ready code templates. SOLID principles, Java 8/11/17, Node.js/TypeScript patterns.
          </p>
        </div>

        <Tabs defaultValue="solid" className="w-full">
          <TabsList className="bg-secondary border border-border mb-6 flex-wrap h-auto gap-1">
            <TabsTrigger 
              value="solid" 
              className="font-mono text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              SOLID Principles
            </TabsTrigger>
            <TabsTrigger 
              value="java" 
              className="font-mono text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Java (8/11/17)
            </TabsTrigger>
            <TabsTrigger 
              value="node" 
              className="font-mono text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Node.js / TypeScript
            </TabsTrigger>
          </TabsList>

          <TabsContent value="solid">
            <SOLIDPrinciples />
          </TabsContent>

          <TabsContent value="java">
            <JavaExamples />
          </TabsContent>

          <TabsContent value="node">
            <NodeExamples />
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
};

export default BestPracticesSection;
