import { CodeEditor } from "./CodeEditor";

const fetchRecipeFromGist = async (gistId) => {
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
  return <CodeEditor onDone={onDone} />;
}
