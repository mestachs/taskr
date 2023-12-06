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

const fetchRecipeFromRepo = async (user, repo, path): Promise<Recipe> => {
  const recipeContent = await fetch(
    `https://raw.githubusercontent.com/${user}/${repo}/${path}`
  ).then((response) => response.text());

  debugger
  return {
    id: user + repo + path,
    name: path,
    editable: true,
    code: recipeContent,
    params: [],
    report: "",
    gist: recipeContent,
  };
};

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

export function GithubBasedEditor({ onDone }) {
  const [recipe, setRecipe] = useState<Recipe>();
  const params = useParams();
  useEffect(() => {
    debugger;
    if (params["source_type"] == "g") {
      fetchRecipeFromGist(params.gistId).then((r) => setRecipe(r));
    } else if (params["source_type"] == "r") {
      fetchRecipeFromRepo(params.repo, params.gistId, params["*"]).then((r) =>
        setRecipe(r)
      );
    }
  }, [params.gistId]);

  if (recipe) {
    return <CodeEditor onDone={onDone} initialCode={recipe.code} />;
  }
  return <h1>Loading gist...</h1>;
}
