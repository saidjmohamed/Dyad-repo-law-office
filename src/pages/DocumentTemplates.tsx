import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import { professionalInfo } from "@/data/professionalInfo";
import { showSuccess, showError } from "@/utils/toast";
import { useState } from "react";

const DocumentTemplates = () => {
  const [documentContent, setDocumentContent] = useState("");

  const generateDocumentText = () => {
    const header = `
${professionalInfo.name}
${professionalInfo.title}
${professionalInfo.address}
تاريخ: ${new Date().toLocaleDateString('ar-DZ')}
`;

    const footer = `
مع خالص التقدير،
${professionalInfo.name}
`;

    return `${header}

${documentContent}

${footer}`;
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generateDocumentText());
      showSuccess("تم نسخ محتوى الوثيقة إلى الحافظة!");
    } catch (err) {
      showError("فشل نسخ محتوى الوثيقة.");
      console.error("Failed to copy document text: ", err);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">قوالب الوثائق</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        استخدم هذه القوالب لإنشاء وثائق قانونية بسرعة مع معلوماتك المهنية المضمنة تلقائيًا.
      </p>

      <Card>
        <CardHeader>
          <CardTitle>قالب وثيقة عام</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="اكتب محتوى وثيقتك هنا..."
            className="min-h-[200px] font-mono text-sm"
            value={documentContent}
            onChange={(e) => setDocumentContent(e.target.value)}
          />
          <div className="relative p-4 border rounded-md bg-gray-50 dark:bg-gray-800 whitespace-pre-wrap text-sm font-mono">
            <h3 className="font-semibold mb-2">معاينة الوثيقة النهائية:</h3>
            {generateDocumentText()}
            <Button
              variant="outline"
              size="icon"
              className="absolute top-2 left-2"
              onClick={handleCopy}
            >
              <Copy className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DocumentTemplates;