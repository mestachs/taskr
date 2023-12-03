import { useParams } from "react-router";
import { CodeEditor } from "./CodeEditor";
import { useEffect, useState } from "react";

interface Recipe {
  id: string;
  name: string;
  editable: boolean;
  code: string;
  report?: string;
  params: any;
  gist: any;
}

const fetchRecipeFromGist = async (gistId): Promise<Recipe> => {
  const gist = await fetch(`https://api.github.com/gists/${gistId}`).then(
    (response) => response.json()
  );

  return {
    id: gistId,
    name: gist.description,
    editable: true,
    code: gist.files["recipe.js"].content,
    params: gist.files["params.json"]
      ? JSON.parse(gist.files["params.json"].content)
      : [],
    report: gist.files["report.md"] ? gist.files["report.md"].content : "",
    gist,
  };
};

export function GistBasedEditor({ onDone }) {
  const [recipe, setRecipe] = useState<Recipe>();
  const params = useParams();
  useEffect(() => {
    fetchRecipeFromGist(params.gistId).then((r) => setRecipe(r));
  }, [params.gistId]);

  if (recipe) {
    return <CodeEditor onDone={onDone} initialCode={recipe.code} />;
  }
  return <h1>Loading gist...</h1>;
}
