# **Nx Monorepo Workflow with Git Worktrees**

This README outlines a comprehensive strategy for managing an Nx monorepo using Git worktrees. It covers creating, managing, and using worktrees to work on multiple libraries and apps simultaneously while maintaining clean branches for development and production.

---

## **Folder Structure**

Your Git repository resides in:

```bash

baudevs-monorepo/
```

Worktrees will be created in a separate directory:

```bash
../baudevs-monorepo.worktrees/
```

---

## **Branching Strategy**

- **main**: Reserved for production-ready code and releases.
- **develop**: Used for active development and integration of features.
- **Feature Branches**: Created for individual features or fixes and merged into develop.

---

## **Workflow Overview**

1. Setup Worktrees

Each worktree represents a branch or workspace dedicated to a specific library or app.

1. Create a base folder for worktrees:

```bash
mkdir -p ../baudevs-monorepo.worktrees
```

2. Add a worktree for develop:

```bash
git worktree add ../baudevs-monorepo.worktrees/develop develop
```

3. Add worktrees for each feature/library:

```bash
cd ../baudevs-monorepo.worktrees/develop
git checkout develop
git branch feature/bau-cms-core
git worktree add ../baudevs-monorepo.worktrees/bau-cms-core feature/bau-cms-core
cd ../baudevs-monorepo.worktrees/bau-cms-core
git checkout -b feature/bau-cms-core
```

4. cd into the worktree and start working on the feature/library

```bash
cd ../baudevs-monorepo.worktrees/bau-cms-core
```

5. Work on the feature/library

```bash
# make changes
nano src/index.ts   
# add the changes
git add .
# commit the changes
git commit -m "Implement feature X for bau-cms-core"

#Test the changes or build the library
nx build bau-cms-core
```

6. Push the feature/library to the remote branch

```bash
git push origin feature/bau-cms-core
```

7. Switch between worktrees with Example commands

---

### **7.1 Example: Switch to the develop worktree and merge the feature/library into develop**

```bash
cd ../baudevs-monorepo
git checkout develop    
git merge feature/bau-cms-core
```

### **7.2 Example: Switch to the feature/bau-cms-core worktree and merge the develop into feature/bau-cms-core**

```bash
cd ../baudevs-monorepo.worktrees/bau-cms-core
git checkout feature/bau-cms-core
git merge develop
```

### **7.3 Example: Switch top bau-cms-database develop a new feature and then test it in the bau-cms-example app**

```bash
cd ../baudevs-monorepo
git checkout develop
git branch feature/bau-cms-database
git worktree add ../baudevs-monorepo.worktrees/bau-cms-database feature/bau-cms-database
cd ../baudevs-monorepo.worktrees/bau-cms-database
git checkout -b feature/bau-cms-database
```

### **7.4 Example: Switch to the bau-cms-example app worktree and test the changes in the bau-cms-example app**

```bash
cd ../baudevs-monorepo
git checkout develop
git merge feature/bau-cms-database
```

---

## **Worktree Structure**

After setup, the structure will look like this:

```bash

├── baudevs-monorepo/
│   ├──apps/
│   │   ├──bau-cms-example/
│   ├──libs/
│   │   ├──bauLogHero/
│   │   ├──bau-cms-templates/
│   │   └──bau-cms-cli/
│   │   ├──bau-cms-core/
│   │   ├──bau-cms-database/
│   │   ├──bau-cms-cli/
│   │   ├──bau-cms-templates/
│   │   └──bau-cms-editor/
│   ├── baudevs-monorepo.worktrees/     # Worktrees folder
│   ├── develop/                        # Worktree for 'develop' branch
│   ├── bau-cms-core/                   # Worktree for 'feature/bau-cms-core' branch
│   ├── bau-cms-database/               # Worktree for 'feature/bau-cms-database' branch
│   ├── bau-cms-cli/                    # Worktree for 'feature/bau-cms-cli' branch
│   ├── bau-cms-templates/              # Worktree for 'feature/bau-cms-templates' branch
│   ├── bau-cms-editor/                 # Worktree for 'feature/bau-cms-editor' branch
│   └── bau-cms-example/                # Worktree for 'feature/bau-cms-example' branch
```

---

## **Git Workflow**

### **Feature Development Workflow**

1. Start a New Feature:

```bash
git worktree add ../baudevs-monorepo.worktrees/bau-cms-core develop
cd ../baudevs-monorepo.worktrees/bau-cms-core
git checkout -b feature/bau-cms-core
```

2. Make Changes:

```bash
git add .
git commit -m "Implement feature X for bau-cms-core"
```

3. Push to Remote:

```bash
git push origin feature/bau-cms-core
```

4. Integrate with Other Libraries:

Merge or rebase feature branches from other libraries into develop.

---

## **Integration and Testing Workflow**

**To integrate all libraries into the app (apps/bau-cms-example):**

1. Create a worktree for the app:

```bash
git worktree add ../baudevs-monorepo.worktrees/bau-cms-example develop
cd ../baudevs-monorepo.worktrees/bau-cms-example
```

2. Run the app:

```bash
nx serve bau-cms-example
```

3. Test changes in the app to ensure all libraries are working together:

---

## **Release Workflow**

1. Merge develop into main:

```bash
git checkout main
git merge develop
```

2. Tag the release:

```bash
git tag -a v1.0.0 -m "Release v1.0.0"
git push origin v1.0.0
```

3. Remove worktrees after merging:

```bash
git worktree remove ../baudevs-monorepo.worktrees/bau-cms-core
```

---

## **Flow Diagrams**

### **Feature Development Flow**

```plaintext
       +---------------------------+
       |      develop Branch       |
       +------------+--------------+
                    |
    +---------------v---------------+
    |  Create feature/bau-cms-core |
    +---------------+---------------+
                    |
    +---------------v---------------+
    |  Make Changes & Commit Locally|
    +---------------+---------------+
                    |
    +---------------v---------------+
    |     Push to Remote Branch     |
    +---------------+---------------+
```

### **Integration and Testing Flow**

```plaintext
+----------------+        +-----------------+
| Work on Feature|        | Work on Feature |
| bau-cms-core   |        | bau-cms-database|
+--------+-------+        +--------+--------+
         |                         |
+--------v-------------------------v--------+
|     Merge into develop & Pull Latest      |
+-----------------------+-------------------+
                        |
        +---------------v---------------+
        |    Run nx serve bau-cms-example |
        +-------------------------------+
```

### **Release Flow**

```plaintext
+---------------------+
|   develop Branch    |
+----------+----------+
           |
+----------v----------+
|   Merge into main    |
+----------+----------+
           |
+----------v----------+
|    Tag and Release   |
+---------------------+
```

---

## **Commands Summary**

| Action | Command |
| --- | --- |
| Add Worktree | git worktree add <path> <branch> |
| Remove Worktree | git worktree remove <path> |
| Checkout Branch | git checkout -b <branch> |
| Commit Changes | git add . && git commit -m "<message>" |
| Push Branch | git push origin <branch> |
| Merge into Develop/Main | git merge <branch> |
| Tag Release | git tag -a vX.X.X -m "Release vX.X.X" |
| Serve App | nx serve <app> |

---

> **CONCLUSION** <br>
> By following this workflow and utilizing Git worktrees, we can streamline development and integration in our Nx monorepo while keeping main clean and production-ready. 🚀  
> **Thank you for reading!**
