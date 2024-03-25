package site

import "github.com/goccy/go-json"

func UnmarshalPackageJSON(data []byte) (PackageJSON, error) {
	var r PackageJSON
	err := json.Unmarshal(data, &r)
	return r, err
}

func (r *PackageJSON) Marshal() ([]byte, error) {
	return json.Marshal(r)
}

type PackageJSON struct {
	Name            string   `json:"name"`
	Version         string   `json:"version"`
	Type            string   `json:"type"`
	Repository      string   `json:"repository"`
	Files           []string `json:"files"`
	Private         bool     `json:"private"`
	Main            string   `json:"main"`
	Module          string   `json:"module"`
	Types           string   `json:"types"`
	DevDependencies map[string]string
	Dependencies    map[string]string
}

var packageJSON PackageJSON
