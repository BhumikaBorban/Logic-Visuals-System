class Node {
    constructor(value, x, y, level) {
        this.value = value;
        this.left = null;
        this.right = null;
        this.x = x;
        this.y = y;
        this.level = level;
    }
}

class BST {
    constructor() {
        this.root = null;
        this.container = document.getElementById('tree-container');
        this.svg = document.getElementById('svg-canvas');
        this.spacing = 200; // Increased base spacing for better clarity
    }

    async insert(value) {
        const yGap = 80;
        // Set a large virtual width for the canvas to allow for branching
        const virtualWidth = 4000; 
        
        if (!this.root) {
            this.root = new Node(value, virtualWidth / 2, 50, 0);
        } else {
            let curr = this.root;
            let level = 1;
            while (true) {
                // Using your specific offset logic
                let offset = this.spacing / Math.pow(1.5, level);
                if (value < curr.value) {
                    if (!curr.left) {
                        curr.left = new Node(value, curr.x - offset, curr.y + yGap, level);
                        break;
                    }
                    curr = curr.left;
                } else if (value > curr.value) {
                    if (!curr.right) {
                        curr.right = new Node(value, curr.x + offset, curr.y + yGap, level);
                        break;
                    }
                    curr = curr.right;
                } else {
                    return; // Prevent duplicate values
                }
                level++;
            }
        }
        this.render();
    }

    // Full Deletion Logic
    delete(value) {
        this.root = this.recursiveDelete(this.root, value);
        this.recalculatePositions();
        this.render();
    }

    recursiveDelete(node, value) {
        if (!node) return null;

        if (value < node.value) {
            node.left = this.recursiveDelete(node.left, value);
        } else if (value > node.value) {
            node.right = this.recursiveDelete(node.right, value);
        } else {
            // Case 1 & 2: Leaf or one child
            if (!node.left) return node.right;
            if (!node.right) return node.left;

            // Case 3: Two children
            let minNode = this.findMin(node.right);
            node.value = minNode.value;
            node.right = this.recursiveDelete(node.right, minNode.value);
        }
        return node;
    }

    findMin(node) {
        while (node.left) node = node.left;
        return node;
    }

    // This ensures that after a deletion, the tree remains centered and correctly spaced
    recalculatePositions() {
        if (!this.root) return;
        const virtualWidth = 4000;
        const update = (node, x, y, level) => {
            if (!node) return;
            node.x = x;
            node.y = y;
            let offset = this.spacing / Math.pow(1.5, level + 1);
            update(node.left, x - offset, y + 80, level + 1);
            update(node.right, x + offset, y + 80, level + 1);
        };
        update(this.root, virtualWidth / 2, 50, 0);
    }

    render() {
        this.container.innerHTML = '';
        this.svg.innerHTML = '';
        this.svg.setAttribute('width', 4000);
        this.svg.setAttribute('height', 1000);
        this.drawTree(this.root);
        
        // Center scroll
        const box = document.getElementById('visualizer-container');
        box.scrollLeft = 2000 - (box.clientWidth / 2);
    }

    drawTree(node) {
        if (!node) return;
        if (node.left) this.drawLine(node.x, node.y, node.left.x, node.left.y);
        if (node.right) this.drawLine(node.x, node.y, node.right.x, node.right.y);

        const nodeEl = document.createElement('div');
        nodeEl.className = 'node';
        nodeEl.id = `node-${node.value}`;
        nodeEl.innerText = node.value;
        nodeEl.style.left = `${node.x - 20}px`;
        nodeEl.style.top = `${node.y - 20}px`;
        this.container.appendChild(nodeEl);

        this.drawTree(node.left);
        this.drawTree(node.right);
    }

    drawLine(x1, y1, x2, y2) {
        const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line.setAttribute("x1", x1); line.setAttribute("y1", y1);
        line.setAttribute("x2", x2); line.setAttribute("y2", y2);
        line.setAttribute("class", "line");
        this.svg.appendChild(line);
    }
}

const tree = new BST();
const sleep = (ms) => new Promise(res => setTimeout(res, ms));

function handleInsert() {
    const val = parseInt(document.getElementById('nodeValue').value);
    if (!isNaN(val)) tree.insert(val);
    document.getElementById('nodeValue').value = '';
}

function handleDelete() {
    const val = parseInt(document.getElementById('nodeValue').value);
    if (!isNaN(val)) tree.delete(val);
    document.getElementById('nodeValue').value = '';
}

function handleClear() {
    tree.root = null;
    tree.render();
}

async function runTraversal(type) {
    const output = document.getElementById('output-text');
    output.innerText = 'Traversing...';
    const sequence = [];

    const traverse = async (node) => {
        if (!node) return;
        if (type === 'preorder') {
            await highlightNode(node, sequence, output);
            await traverse(node.left);
            await traverse(node.right);
        } else if (type === 'inorder') {
            await traverse(node.left);
            await highlightNode(node, sequence, output);
            await traverse(node.right);
        } else if (type === 'postorder') {
            await traverse(node.left);
            await traverse(node.right);
            await highlightNode(node, sequence, output);
        }
    };

    if (type === 'levelorder') {
        let queue = [tree.root];
        while(queue.length > 0) {
            let node = queue.shift();
            if(node) {
                await highlightNode(node, sequence, output);
                queue.push(node.left);
                queue.push(node.right);
            }
        }
    } else {
        await traverse(tree.root);
    }
}

async function highlightNode(node, sequence, output) {
    const el = document.getElementById(`node-${node.value}`);
    el.classList.add('highlight');
    sequence.push(node.value);
    output.innerText = sequence.join(' → ');
    await sleep(800);
    el.classList.remove('highlight');
}