import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Workflow, GitBranch, Layers, Server } from "lucide-react";
import CodeBlock from "./CodeBlock";

const osbProxyCode = `<?xml version="1.0" encoding="UTF-8"?>
<xml-fragment xmlns:ser="http://www.bea.com/wli/sb/services">
  <ser:coreEntry isProxy="true" isEnabled="true">
    <ser:binding type="SOAP" isSoap12="false" xsi:type="con:SoapBindingType">
      <con:wsdl ref="OrderService/wsdl/OrderService"/>
      <con:binding>
        <con:name>OrderServiceBinding</con:name>
        <con:namespace>http://enterprise.com/orders</con:namespace>
      </con:binding>
    </ser:binding>
  </ser:coreEntry>
</xml-fragment>

<!-- Pipeline Configuration -->
<con:pipeline type="request" name="RequestPipeline">
  <con:stage name="ValidateRequest">
    <con:context/>
    <con:actions>
      <!-- Schema Validation -->
      <con:validate>
        <con:schema ref="OrderService/xsd/OrderRequest"/>
        <con:schemaElement>
          <con:localName>OrderRequest</con:localName>
          <con:namespace>http://enterprise.com/orders</con:namespace>
        </con:schemaElement>
        <con:varName>body</con:varName>
        <con:location>
          <con:xpathText>./ord:OrderRequest</con:xpathText>
        </con:location>
      </con:validate>
      
      <!-- Logging -->
      <con:log>
        <con:logLevel>info</con:logLevel>
        <con:message>Processing Order Request</con:message>
        <con:expr>
          <con:xqueryText>$body/ord:OrderRequest/ord:orderId</con:xqueryText>
        </con:expr>
      </con:log>
    </con:actions>
  </con:stage>
  
  <con:stage name="TransformRequest">
    <con:actions>
      <!-- XSLT Transformation -->
      <con:replace varName="body" contents-only="true">
        <con:location>
          <con:xpathText>.</con:xpathText>
        </con:location>
        <con:expr>
          <con:xsltTransform>
            <con:resource ref="OrderService/xslt/OrderRequestTransform"/>
            <con:input>$body</con:input>
          </con:xsltTransform>
        </con:expr>
      </con:replace>
    </con:actions>
  </con:stage>
</con:pipeline>`;

const bpmProcessCode = `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:process id="OrderApprovalProcess" name="Order Approval" isExecutable="true">
  
  <!-- Start Event -->
  <bpmn:startEvent id="StartEvent" name="Order Received">
    <bpmn:outgoing>Flow_ToValidation</bpmn:outgoing>
  </bpmn:startEvent>

  <!-- Service Task: Validate Order -->
  <bpmn:serviceTask id="ValidateOrder" name="Validate Order" 
                    implementation="##WebService">
    <bpmn:extensionElements>
      <oracle:serviceTask>
        <oracle:service ref="OrderValidationService"/>
        <oracle:operation>validateOrder</oracle:operation>
      </oracle:serviceTask>
    </bpmn:extensionElements>
    <bpmn:incoming>Flow_ToValidation</bpmn:incoming>
    <bpmn:outgoing>Flow_ToGateway</bpmn:outgoing>
  </bpmn:serviceTask>

  <!-- Exclusive Gateway: Check Amount -->
  <bpmn:exclusiveGateway id="AmountGateway" name="Check Order Amount">
    <bpmn:incoming>Flow_ToGateway</bpmn:incoming>
    <bpmn:outgoing>Flow_HighValue</bpmn:outgoing>
    <bpmn:outgoing>Flow_LowValue</bpmn:outgoing>
  </bpmn:exclusiveGateway>

  <!-- Human Task: Manager Approval -->
  <bpmn:userTask id="ManagerApproval" name="Manager Approval">
    <bpmn:extensionElements>
      <oracle:humanTask>
        <oracle:title>Order Approval Required</oracle:title>
        <oracle:assignees>
          <oracle:role>OrderManagers</oracle:role>
        </oracle:assignees>
        <oracle:payload>
          <oracle:dataInput ref="orderData"/>
        </oracle:payload>
      </oracle:humanTask>
    </bpmn:extensionElements>
    <bpmn:incoming>Flow_HighValue</bpmn:incoming>
    <bpmn:outgoing>Flow_ToProcess</bpmn:outgoing>
  </bpmn:userTask>

  <!-- Service Task: Process Order -->
  <bpmn:serviceTask id="ProcessOrder" name="Process Order">
    <bpmn:extensionElements>
      <oracle:serviceTask>
        <oracle:service ref="OrderProcessingService"/>
        <oracle:operation>processOrder</oracle:operation>
      </oracle:serviceTask>
    </bpmn:extensionElements>
    <bpmn:incoming>Flow_LowValue</bpmn:incoming>
    <bpmn:incoming>Flow_ToProcess</bpmn:incoming>
    <bpmn:outgoing>Flow_ToEnd</bpmn:outgoing>
  </bpmn:serviceTask>

  <!-- End Event -->
  <bpmn:endEvent id="EndEvent" name="Order Completed">
    <bpmn:incoming>Flow_ToEnd</bpmn:incoming>
  </bpmn:endEvent>

  <!-- Sequence Flows with Conditions -->
  <bpmn:sequenceFlow id="Flow_HighValue" sourceRef="AmountGateway" targetRef="ManagerApproval">
    <bpmn:conditionExpression xsi:type="bpmn:tFormalExpression">
      \${orderAmount > 10000}
    </bpmn:conditionExpression>
  </bpmn:sequenceFlow>
  
  <bpmn:sequenceFlow id="Flow_LowValue" sourceRef="AmountGateway" targetRef="ProcessOrder">
    <bpmn:conditionExpression xsi:type="bpmn:tFormalExpression">
      \${orderAmount <= 10000}
    </bpmn:conditionExpression>
  </bpmn:sequenceFlow>

</bpmn:process>`;

const soaCompositeCode = `<?xml version="1.0" encoding="UTF-8"?>
<composite name="OrderIntegrationComposite"
           xmlns="http://xmlns.oracle.com/sca/1.0"
           xmlns:ui="http://xmlns.oracle.com/soa/designer">

  <!-- Exposed Services -->
  <service name="OrderService" ui:wsdlLocation="OrderService.wsdl">
    <interface.wsdl interface="http://enterprise.com/orders#wsdl.interface(OrderPortType)"/>
    <binding.ws port="http://enterprise.com/orders#wsdl.endpoint(OrderService/OrderPort)"/>
  </service>

  <!-- BPEL Process Component -->
  <component name="OrderOrchestration">
    <implementation.bpel src="bpel/OrderOrchestration.bpel"/>
    <property name="bpel.config.transaction">required</property>
  </component>

  <!-- Mediator Component for Routing -->
  <component name="OrderRouter">
    <implementation.mediator src="mediator/OrderRouter.mplan"/>
  </component>

  <!-- External Service References -->
  <reference name="InventoryService" ui:wsdlLocation="external/InventoryService.wsdl">
    <interface.wsdl interface="http://enterprise.com/inventory#wsdl.interface(InventoryPortType)"/>
    <binding.ws port="http://enterprise.com/inventory#wsdl.endpoint(InventoryService/InventoryPort)"
                location="http://inventory-service:8080/inventory"/>
  </reference>

  <reference name="PaymentService" ui:wsdlLocation="external/PaymentService.wsdl">
    <interface.wsdl interface="http://enterprise.com/payment#wsdl.interface(PaymentPortType)"/>
    <binding.ws port="http://enterprise.com/payment#wsdl.endpoint(PaymentService/PaymentPort)"
                location="http://payment-service:8080/payment"/>
  </reference>

  <!-- JMS Adapter for Async Messaging -->
  <reference name="OrderNotificationQueue">
    <interface.wsdl interface="http://enterprise.com/jms#wsdl.interface(JMSInterface)"/>
    <binding.jca config="adapter/OrderNotificationAdapter.jca"/>
  </reference>

  <!-- Database Adapter -->
  <reference name="OrderDatabaseAdapter">
    <interface.wsdl interface="http://enterprise.com/db#wsdl.interface(DBInterface)"/>
    <binding.jca config="adapter/OrderDBAdapter.jca"/>
  </reference>

  <!-- Wiring -->
  <wire>
    <source.uri>OrderService</source.uri>
    <target.uri>OrderRouter</target.uri>
  </wire>
  <wire>
    <source.uri>OrderRouter</source.uri>
    <target.uri>OrderOrchestration</target.uri>
  </wire>
  <wire>
    <source.uri>OrderOrchestration/InventoryService</source.uri>
    <target.uri>InventoryService</target.uri>
  </wire>
  <wire>
    <source.uri>OrderOrchestration/PaymentService</source.uri>
    <target.uri>PaymentService</target.uri>
  </wire>

</composite>`;

const xsltTransformCode = `<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0"
    xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:ord="http://enterprise.com/orders"
    xmlns:tgt="http://enterprise.com/target"
    exclude-result-prefixes="ord">

  <xsl:output method="xml" indent="yes"/>

  <!-- Main Template -->
  <xsl:template match="/">
    <tgt:ProcessOrderRequest>
      <xsl:apply-templates select="ord:OrderRequest"/>
    </tgt:ProcessOrderRequest>
  </xsl:template>

  <!-- Order Mapping -->
  <xsl:template match="ord:OrderRequest">
    <tgt:Header>
      <tgt:TransactionId>
        <xsl:value-of select="concat('TXN-', ord:orderId, '-', format-dateTime(current-dateTime(), '[Y0001][M01][D01][H01][m01][s01]'))"/>
      </tgt:TransactionId>
      <tgt:Timestamp>
        <xsl:value-of select="current-dateTime()"/>
      </tgt:Timestamp>
      <tgt:SourceSystem>ORDER_PORTAL</tgt:SourceSystem>
    </tgt:Header>
    
    <tgt:OrderDetails>
      <tgt:OrderId><xsl:value-of select="ord:orderId"/></tgt:OrderId>
      <tgt:CustomerInfo>
        <tgt:CustomerId><xsl:value-of select="ord:customer/ord:id"/></tgt:CustomerId>
        <tgt:FullName>
          <xsl:value-of select="concat(ord:customer/ord:firstName, ' ', ord:customer/ord:lastName)"/>
        </tgt:FullName>
        <tgt:Email><xsl:value-of select="ord:customer/ord:email"/></tgt:Email>
      </tgt:CustomerInfo>
      
      <tgt:Items>
        <xsl:for-each select="ord:items/ord:item">
          <tgt:LineItem>
            <tgt:SKU><xsl:value-of select="ord:sku"/></tgt:SKU>
            <tgt:Quantity><xsl:value-of select="ord:quantity"/></tgt:Quantity>
            <tgt:UnitPrice><xsl:value-of select="ord:price"/></tgt:UnitPrice>
            <tgt:LineTotal>
              <xsl:value-of select="ord:quantity * ord:price"/>
            </tgt:LineTotal>
          </tgt:LineItem>
        </xsl:for-each>
      </tgt:Items>
      
      <tgt:TotalAmount>
        <xsl:value-of select="sum(ord:items/ord:item/(ord:quantity * ord:price))"/>
      </tgt:TotalAmount>
    </tgt:OrderDetails>
  </xsl:template>

</xsl:stylesheet>`;

const SOASection = () => {
  return (
    <section id="soa" className="py-20 px-4 bg-secondary/30">
      <div className="container max-w-6xl">
        <div className="space-y-4 mb-12">
          <h2 className="text-3xl font-bold font-mono">
            <span className="text-primary">#</span> Oracle SOA Suite 12c
          </h2>
          <p className="text-muted-foreground max-w-2xl">
            Enterprise integration patterns with Oracle Service Bus, BPM, and SOA Composite applications.
          </p>
        </div>

        {/* Architecture Overview */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          <Card className="bg-card border-border card-hover">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-mono flex items-center gap-2">
                <Layers className="w-4 h-4 text-terminal-orange" />
                Oracle Service Bus (OSB)
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground space-y-2">
              <p>Service virtualization and mediation layer</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Proxy services & pipelines</li>
                <li>Message transformation (XSLT/XQuery)</li>
                <li>Routing & content-based routing</li>
                <li>Security policies & throttling</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-card border-border card-hover border-primary/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-mono flex items-center gap-2">
                <Workflow className="w-4 h-4 text-primary" />
                Oracle BPM
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground space-y-2">
              <p>Business process automation and orchestration</p>
              <ul className="list-disc list-inside space-y-1">
                <li>BPMN 2.0 process modeling</li>
                <li>Human tasks & workflows</li>
                <li>Business rules engine</li>
                <li>Process analytics & BAM</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-card border-border card-hover">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-mono flex items-center gap-2">
                <GitBranch className="w-4 h-4 text-accent" />
                SOA Composite
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground space-y-2">
              <p>Service composition and orchestration</p>
              <ul className="list-disc list-inside space-y-1">
                <li>BPEL process orchestration</li>
                <li>Mediator routing patterns</li>
                <li>JCA/DB/File adapters</li>
                <li>Error handling & recovery</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-card border-border card-hover border-accent/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-mono flex items-center gap-2">
                <Server className="w-4 h-4 text-terminal-purple" />
                WebLogic Server
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground space-y-2">
              <p>Enterprise application server administration</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Domain & cluster management</li>
                <li>WLST scripting automation</li>
                <li>DataSource & JMS configuration</li>
                <li>Deployment & Node Manager</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="osb" className="w-full">
          <TabsList className="bg-secondary border border-border mb-6 flex-wrap h-auto">
            <TabsTrigger 
              value="osb" 
              className="font-mono data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              OSB Proxy
            </TabsTrigger>
            <TabsTrigger 
              value="bpm" 
              className="font-mono data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              BPM Process
            </TabsTrigger>
            <TabsTrigger 
              value="composite" 
              className="font-mono data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              SOA Composite
            </TabsTrigger>
            <TabsTrigger 
              value="xslt" 
              className="font-mono data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              XSLT Transform
            </TabsTrigger>
          </TabsList>

          <TabsContent value="osb" className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-primary font-mono">
                OSB Proxy Service with Pipeline
              </h3>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>WSDL-based proxy service configuration</li>
                <li>Request validation with XSD schemas</li>
                <li>XSLT message transformation</li>
                <li>Structured logging for debugging</li>
              </ul>
            </div>
            <CodeBlock 
              code={osbProxyCode} 
              language="xml" 
              filename="OrderProxy.proxy" 
            />
          </TabsContent>

          <TabsContent value="bpm" className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-primary font-mono">
                BPMN Process with Human Tasks
              </h3>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>Order validation service task</li>
                <li>Conditional gateway for approval routing</li>
                <li>Human task assignment by role</li>
                <li>Expression-based flow conditions</li>
              </ul>
            </div>
            <CodeBlock 
              code={bpmProcessCode} 
              language="xml" 
              filename="OrderApprovalProcess.bpmn" 
            />
          </TabsContent>

          <TabsContent value="composite" className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-primary font-mono">
                SOA Composite Application
              </h3>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>BPEL orchestration component</li>
                <li>Mediator for message routing</li>
                <li>External service references (WS)</li>
                <li>JCA adapters for JMS and Database</li>
              </ul>
            </div>
            <CodeBlock 
              code={soaCompositeCode} 
              language="xml" 
              filename="composite.xml" 
            />
          </TabsContent>

          <TabsContent value="xslt" className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-primary font-mono">
                XSLT 2.0 Transformation
              </h3>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>Namespace handling and mapping</li>
                <li>Dynamic transaction ID generation</li>
                <li>Iterating over collections (for-each)</li>
                <li>Aggregate calculations (sum)</li>
              </ul>
            </div>
            <CodeBlock 
              code={xsltTransformCode} 
              language="xml" 
              filename="OrderRequestTransform.xslt" 
            />
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
};

export default SOASection;
