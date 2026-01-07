// project-loader.js - Functions for loading project data
const ProjectLoader = {
    // Load the main project configuration file
    loadProjectConfig: function() {
        return fetch('projects.json')
            .then(response => response.json())
            .then(data => {
                // Store timeline configuration
                const timelineConfig = data.timelineConfig;
                
                // Load all project collections
                const collectionPromises = data.collections.map(collection => 
                    fetch(collection.path)
                        .then(response => response.json())
                        .then(collectionData => {
                            return {
                                name: collection.name,
                                projects: collectionData.projects
                            };
                        })
                );
                
                // Wait for all collections to load
                return Promise.all(collectionPromises).then(collections => {
                    return {
                        collections: collections,
                        config: timelineConfig
                    };
                });
            });
    },
    
    // Get all projects from all collections
    getAllProjects: function(allData) {
        const allProjects = [];
        allData.collections.forEach(collection => {
            collection.projects.forEach(project => {
                // Add the collection name as a property
                project.collection = collection.name;
                allProjects.push(project);
            });
        });
        
        // Sort projects by position (from future to past)
        allProjects.sort((a, b) => b.position - a.position);
        
        return allProjects;
    },
    
    // Move a project between collections
    moveProject: function(projectId, sourceCollection, targetCollection) {
        console.log(`Moving project ${projectId} from ${sourceCollection} to ${targetCollection}`);
        
        // In a production environment, this would make API calls to the server
        // to handle the data updates and file modifications
        
        // For demonstration purposes, we'll just log the action
        // and rely on page refresh to show updated data
        
        // In a real implementation, this would:
        // 1. Get the project from source collection
        // 2. Remove it from source collection
        // 3. Add it to target collection with updated position
        // 4. Save both JSON files
        // 5. Refresh the UI
    }
};