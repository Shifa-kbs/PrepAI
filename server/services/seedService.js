const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Question = require('../models/Question');
const QuestionProgress = require('../models/QuestionProgress');

dotenv.config({ path: __dirname + '/../.env' });

const questionsData = [
  // --- DSA (Data Structures & Algorithms) ---
  {
    title: 'Two Sum Problem',
    category: 'DSA',
    difficulty: 'Easy',
    companyTags: ['Amazon', 'Google', 'Meta'],
    type: 'coding',
    description: 'Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`. Assume exactly one solution exists.',
    codeTemplate: 'function twoSum(nums, target) {\n  // Write your code here\n}',
    sampleAnswer: 'function twoSum(nums, target) {\n  const map = new Map();\n  for (let i = 0; i < nums.length; i++) {\n    const diff = target - nums[i];\n    if (map.has(diff)) return [map.get(diff), i];\n    map.set(nums[i], i);\n  }\n  return [];\n}',
    explanation: 'Utilizes a Hash Map to store complement values in O(N) time complexity and O(N) space complexity.',
  },
  {
    title: 'Reverse a Linked List',
    category: 'DSA',
    difficulty: 'Easy',
    companyTags: ['Microsoft', 'Amazon', 'TCS'],
    type: 'coding',
    description: 'Given the head of a singly linked list, reverse the list and return its new head.',
    codeTemplate: 'function reverseList(head) {\n  // Write your code here\n}',
    sampleAnswer: 'function reverseList(head) {\n  let prev = null, curr = head;\n  while (curr) {\n    let next = curr.next;\n    curr.next = prev;\n    prev = curr;\n    curr = next;\n  }\n  return prev;\n}',
    explanation: 'Uses iterative pointer manipulation maintaining previous, current, and next node references in O(N) time and O(1) space.',
  },
  {
    title: 'Longest Substring Without Repeating Characters',
    category: 'DSA',
    difficulty: 'Medium',
    companyTags: ['Google', 'Amazon', 'Uber'],
    type: 'coding',
    description: 'Given a string `s`, find the length of the longest substring without repeating characters.',
    codeTemplate: 'function lengthOfLongestSubstring(s) {\n  // Write your code here\n}',
    sampleAnswer: 'function lengthOfLongestSubstring(s) {\n  let set = new Set(), max = 0, l = 0;\n  for (let r = 0; r < s.length; r++) {\n    while (set.has(s[r])) {\n      set.delete(s[l++]);\n    }\n    set.add(s[r]);\n    max = Math.max(max, r - l + 1);\n  }\n  return max;\n}',
    explanation: 'Sliding window technique using a hash set to track character occurrences in O(N) time complexity.',
  },
  {
    title: 'Binary Tree Level Order Traversal',
    category: 'DSA',
    difficulty: 'Medium',
    companyTags: ['Meta', 'Microsoft', 'Adobe'],
    type: 'coding',
    description: 'Given the root of a binary tree, return the level order traversal of its nodes\' values (from left to right, level by level).',
    codeTemplate: 'function levelOrder(root) {\n  // Write your code here\n}',
    sampleAnswer: 'function levelOrder(root) {\n  if (!root) return [];\n  const result = [], queue = [root];\n  while (queue.length) {\n    const levelSize = queue.length, currentLevel = [];\n    for (let i = 0; i < levelSize; i++) {\n      const node = queue.shift();\n      currentLevel.push(node.val);\n      if (node.left) queue.push(node.left);\n      if (node.right) queue.push(node.right);\n    }\n    result.push(currentLevel);\n  }\n  return result;\n}',
    explanation: 'Breadth-First Search (BFS) algorithm using a Queue data structure.',
  },
  {
    title: 'Merge K Sorted Lists',
    category: 'DSA',
    difficulty: 'Hard',
    companyTags: ['Google', 'Amazon', 'Apple'],
    type: 'coding',
    description: 'You are given an array of k linked-lists `lists`, each linked-list is sorted in ascending order. Merge all the linked-lists into one sorted linked-list and return it.',
    codeTemplate: 'function mergeKLists(lists) {\n  // Write your code here\n}',
    sampleAnswer: 'Use Min-Heap / Priority Queue or Divide & Conquer merge sort on list pairs in O(N log K) time complexity.',
    explanation: 'Divide and conquer pair merging achieves optimal performance.',
  },

  // --- JAVA ---
  {
    title: 'Difference Between String, StringBuilder, and StringBuffer',
    category: 'Java',
    difficulty: 'Easy',
    companyTags: ['TCS', 'Infosys', 'Wipro'],
    type: 'conceptual',
    description: 'Explain the difference between String, StringBuilder, and StringBuffer in Java regarding immutability, performance, and thread safety.',
    sampleAnswer: 'String is immutable and stored in String Constant Pool. StringBuffer is mutable and thread-safe (synchronized). StringBuilder is mutable and not thread-safe (faster performance in single-threaded environments).',
    explanation: 'String immutability promotes security & memory efficiency. StringBuffer synchronization provides thread safety at the expense of locking overhead.',
  },
  {
    title: 'How Does HashMap Work Internally in Java 8+?',
    category: 'Java',
    difficulty: 'Medium',
    companyTags: ['Oracle', 'Amazon', 'Goldman Sachs'],
    type: 'conceptual',
    description: 'Explain how HashMap handles key-value insertion, hashing, index calculation, collision resolution, and treeification in Java 8+.',
    sampleAnswer: 'HashMap uses an array of Node buckets. Hash code is computed and index determined by (n-1) & hash. Collisions use LinkedList chaining. In Java 8+, if bucket count exceeds 8 (TREEIFY_THRESHOLD) and array capacity >= 64, list converts to Red-Black Tree improving search from O(N) to O(log N).',
    explanation: 'Treeification prevents worst-case O(N) hash collision Denial-of-Service attacks.',
  },
  {
    title: 'Java Garbage Collection Algorithms & Generations',
    category: 'Java',
    difficulty: 'Hard',
    companyTags: ['Google', 'Oracle', 'JPMorgan'],
    type: 'conceptual',
    description: 'Explain Java Heap memory generations (Young, Old, Metaspace) and GC algorithms like G1, ZGC, and CMS.',
    sampleAnswer: 'Java Heap is split into Young Gen (Eden, Survivor spaces) and Old Gen. Minor GC collects Young Gen; Major GC collects Old Gen. G1GC divides heap into equal regions and prioritizes regions with most garbage.',
    explanation: 'Generational hypothesis assumes most created objects die young.',
  },
  {
    title: 'Equals and HashCode Contract in Java',
    category: 'Java',
    difficulty: 'Medium',
    companyTags: ['Accenture', 'TCS', 'Cognizant'],
    type: 'conceptual',
    description: 'Why must equals() and hashCode() be overridden together in custom Java classes?',
    sampleAnswer: 'If two objects are equal according to equals(), they MUST have the same hashCode(). Failing to override both breaks hash-based collections like HashMap and HashSet, causing duplicate key insertions.',
    explanation: 'HashMap relies on hashCode() for bucket placement before checking equals().',
  },
  {
    title: 'Java Stream API Operations & Parallel Streams',
    category: 'Java',
    difficulty: 'Medium',
    companyTags: ['Capgemini', 'IBM', 'HCL'],
    type: 'conceptual',
    description: 'Differentiate intermediate vs terminal stream operations in Java 8. When should parallelStream() be used?',
    sampleAnswer: 'Intermediate operations (filter, map) are lazy and return a new Stream. Terminal operations (collect, count) trigger processing. Use parallelStream for CPU-intensive independent tasks over massive collections.',
    explanation: 'Parallel streams utilize ForkJoinPool for parallel execution.',
  },

  // --- PYTHON ---
  {
    title: 'GIL (Global Interpreter Lock) in Python',
    category: 'Python',
    difficulty: 'Medium',
    companyTags: ['Meta', 'Uber', 'Dropbox'],
    type: 'conceptual',
    description: 'Explain the Global Interpreter Lock (GIL) in CPython and how it impacts multithreading vs multiprocessing.',
    sampleAnswer: 'GIL is a mutex that allows only one thread to execute Python bytecode at a time in CPython. Multithreading is effective for I/O-bound tasks, while CPU-bound tasks require multiprocessing to bypass GIL.',
    explanation: 'GIL simplifies memory management and C-extension integration.',
  },
  {
    title: 'Python Decorators & Closures',
    category: 'Python',
    difficulty: 'Medium',
    companyTags: ['Netflix', 'Spotify', 'Amazon'],
    type: 'conceptual',
    description: 'What is a Python decorator? Explain how function wrapping works with closures and *args, **kwargs.',
    sampleAnswer: 'A decorator is a callable that takes a function as argument and returns a modified wrapper function. It relies on closures to retain scope.',
    codeTemplate: 'def my_decorator(func):\n  def wrapper(*args, **kwargs):\n    # logic\n    return func(*args, **kwargs)\n  return wrapper',
    explanation: 'Decorators implement the Decorator Design Pattern cleanly using first-class functions.',
  },
  {
    title: 'Generators vs Iterators in Python',
    category: 'Python',
    difficulty: 'Easy',
    companyTags: ['TCS', 'Infosys', 'Paytm'],
    type: 'conceptual',
    description: 'Explain the difference between Python generators (yield) and custom iterators (__iter__, __next__).',
    sampleAnswer: 'Iterators explicitly implement __iter__() and __next__() methods. Generators are functions that use `yield` to return values lazily without storing the entire collection in memory.',
    explanation: 'Generators provide high memory efficiency for large streams.',
  },
  {
    title: 'Python List Comprehension vs Generator Expressions',
    category: 'Python',
    difficulty: 'Easy',
    companyTags: ['Accenture', 'Wipro'],
    type: 'conceptual',
    description: 'Compare syntax and memory consumption of List Comprehension `[x for x in data]` vs Generator Expressions `(x for x in data)`.',
    sampleAnswer: 'List comprehension creates the entire list in memory immediately. Generator expression creates a generator object that evaluates items lazily on-demand.',
    explanation: 'Generator expressions save memory for large datasets.',
  },
  {
    title: 'Python Deep Copy vs Shallow Copy',
    category: 'Python',
    difficulty: 'Medium',
    companyTags: ['Microsoft', 'Amazon'],
    type: 'conceptual',
    description: 'Explain copy.copy() vs copy.deepcopy() when dealing with nested object structures in Python.',
    sampleAnswer: 'Shallow copy creates a new collection object but populates it with references to child objects. Deep copy recursively copies all nested objects.',
    explanation: 'Modifying nested elements in shallow copy mutates the original object.',
  },

  // --- SQL ---
  {
    title: 'Find Second Highest Salary in Employee Table',
    category: 'SQL',
    difficulty: 'Medium',
    companyTags: ['Amazon', 'Microsoft', 'Flipkart'],
    type: 'coding',
    description: 'Write an SQL query to find the second highest salary from the Employee table. Handle duplicate salary values gracefully.',
    codeTemplate: 'SELECT ... FROM Employee ...',
    sampleAnswer: 'SELECT MAX(salary) AS SecondHighestSalary FROM Employee WHERE salary < (SELECT MAX(salary) FROM Employee);',
    explanation: 'Alternative solution using DENSE_RANK(): SELECT salary FROM (SELECT salary, DENSE_RANK() OVER (ORDER BY salary DESC) as rnk FROM Employee) t WHERE rnk = 2 LIMIT 1;',
  },
  {
    title: 'Types of SQL Joins Explained',
    category: 'SQL',
    difficulty: 'Easy',
    companyTags: ['TCS', 'Infosys', 'Capgemini'],
    type: 'conceptual',
    description: 'Differentiate INNER JOIN, LEFT OUTER JOIN, RIGHT OUTER JOIN, FULL OUTER JOIN, and CROSS JOIN with Venn diagrams logic.',
    sampleAnswer: 'INNER JOIN returns matching rows in both tables. LEFT JOIN returns all rows from left table + matched right rows. RIGHT JOIN returns all right rows + matched left rows. FULL JOIN returns all rows when a match exists in either table. CROSS JOIN returns Cartesian product.',
    explanation: 'Joins form the foundation of relational data retrieval.',
  },
  {
    title: 'SQL Window Functions (ROW_NUMBER, RANK, DENSE_RANK)',
    category: 'SQL',
    difficulty: 'Medium',
    companyTags: ['Uber', 'Goldman Sachs', 'Oracle'],
    type: 'conceptual',
    description: 'Explain the difference between ROW_NUMBER(), RANK(), and DENSE_RANK() when ordering values with duplicates.',
    sampleAnswer: 'ROW_NUMBER assigns unique sequential integers regardless of ties (1,2,3,4). RANK assigns duplicate ranks to ties and skips subsequent numbers (1,2,2,4). DENSE_RANK assigns duplicate ranks to ties without skipping (1,2,2,3).',
    explanation: 'Window functions perform calculations across a set of table rows related to the current row.',
  },
  {
    title: 'SQL GROUP BY vs HAVING Clause',
    category: 'SQL',
    difficulty: 'Easy',
    companyTags: ['Accenture', 'Cognizant'],
    type: 'conceptual',
    description: 'What is the functional difference between WHERE and HAVING clauses in SQL queries?',
    sampleAnswer: 'WHERE filters individual records before grouping occurs. HAVING filters aggregated group results after GROUP BY calculation.',
    explanation: 'WHERE cannot contain aggregate functions like SUM() or COUNT(), whereas HAVING can.',
  },
  {
    title: 'Delete Duplicate Records in SQL Table',
    category: 'SQL',
    difficulty: 'Hard',
    companyTags: ['Meta', 'Amazon'],
    type: 'coding',
    description: 'Write an SQL query to delete duplicate rows from a table based on email address, keeping the row with the lowest id.',
    codeTemplate: 'DELETE p1 FROM Person p1 JOIN Person p2 ...',
    sampleAnswer: 'DELETE p1 FROM Person p1 JOIN Person p2 ON p1.email = p2.email WHERE p1.id > p2.id;',
    explanation: 'Self-join matching duplicate attributes while filtering out higher duplicate IDs.',
  },

  // --- DBMS ---
  {
    title: 'ACID Properties in Relational Databases',
    category: 'DBMS',
    difficulty: 'Easy',
    companyTags: ['TCS', 'Wipro', 'HCL'],
    type: 'conceptual',
    description: 'Define Atomicity, Consistency, Isolation, and Durability (ACID) in database management systems.',
    sampleAnswer: 'Atomicity: All operations in a transaction succeed or all roll back. Consistency: Database transitions from one valid state to another. Isolation: Concurrent transactions execute without mutual interference. Durability: Committed transactions persist permanently even during power outages.',
    explanation: 'ACID guarantees database reliability during transactions.',
  },
  {
    title: 'Database Normalization (1NF to BCNF)',
    category: 'DBMS',
    difficulty: 'Medium',
    companyTags: ['Oracle', 'Microsoft', 'Infosys'],
    type: 'conceptual',
    description: 'Explain Database Normal Forms: 1NF, 2NF, 3NF, and Boyce-Codd Normal Form (BCNF) with real-world reduction goals.',
    sampleAnswer: '1NF eliminates repeating groups/arrays. 2NF removes partial dependencies (non-key attributes depending on part of composite key). 3NF eliminates transitive dependencies. BCNF ensures every determinant is a super key.',
    explanation: 'Normalization minimizes data redundancy and anomaly risks (Insertion, Update, Deletion).',
  },
  {
    title: 'Transaction Isolation Levels & Read Phenomena',
    category: 'DBMS',
    difficulty: 'Hard',
    companyTags: ['Amazon', 'Google', 'Goldman Sachs'],
    type: 'conceptual',
    description: 'Explain Dirty Read, Non-Repeatable Read, and Phantom Read. Compare isolation levels: Read Uncommitted, Read Committed, Repeatable Read, Serializable.',
    sampleAnswer: 'Read Uncommitted allows Dirty Reads. Read Committed prevents Dirty Reads. Repeatable Read prevents Dirty & Non-Repeatable Reads. Serializable prevents all phenomena including Phantom Reads using lock protocols.',
    explanation: 'Higher isolation levels increase consistency but reduce concurrent throughput.',
  },
  {
    title: 'B-Tree vs B+ Tree Indexing in Relational Databases',
    category: 'DBMS',
    difficulty: 'Medium',
    companyTags: ['Uber', 'LinkedIn'],
    type: 'conceptual',
    description: 'Why do relational databases like MySQL (InnoDB) use B+ Trees instead of B-Trees for table indexing?',
    sampleAnswer: 'In B+ Trees, data pointers exist exclusively in leaf nodes, and leaf nodes are linked sequentially in a doubly-linked list. This enables faster sequential range scans and higher node fan-out in memory.',
    explanation: 'B+ tree leaf chaining yields high disk page fetch efficiency.',
  },
  {
    title: 'NoSQL vs RDBMS Architectural Comparison',
    category: 'DBMS',
    difficulty: 'Easy',
    companyTags: ['MongoDB', 'Amazon', 'PayPal'],
    type: 'conceptual',
    description: 'When should you choose a NoSQL database (e.g., MongoDB, DynamoDB) over a traditional RDBMS (e.g., PostgreSQL, MySQL)?',
    sampleAnswer: 'RDBMS suits structured data requiring strict ACID guarantees and complex JOIN operations. NoSQL suits unstructured/semi-structured data, dynamic schemas, horizontal scaling, and massive read/write velocity.',
    explanation: 'CAP theorem guides NoSQL trade-offs (Consistency vs Availability vs Partition Tolerance).',
  },

  // --- OPERATING SYSTEMS ---
  {
    title: 'Process vs Thread Memory Layout',
    category: 'Operating Systems',
    difficulty: 'Easy',
    companyTags: ['Microsoft', 'Intel', 'Qualcomm'],
    type: 'conceptual',
    description: 'Differentiate a Process from a Thread in terms of memory sharing, context switching overhead, and isolation.',
    sampleAnswer: 'A Process is an independent executing program instance with its own virtual address space (Heap, Code, Data). A Thread is a lightweight execution unit inside a process that shares the heap, global variables, and code section but has its own Stack and Register state.',
    explanation: 'Thread context switching is faster due to shared virtual memory mappings.',
  },
  {
    title: 'Deadlock Necessary Conditions & Coffman Conditions',
    category: 'Operating Systems',
    difficulty: 'Medium',
    companyTags: ['Amazon', 'Cisco', 'Samsung'],
    type: 'conceptual',
    description: 'What are the 4 Coffman conditions required for a deadlock to occur? How does Bankers Algorithm prevent deadlocks?',
    sampleAnswer: 'The 4 conditions are: 1. Mutual Exclusion 2. Hold and Wait 3. No Preemption 4. Circular Wait. Bankers Algorithm tests for safety by simulating resource allocation before granting requests.',
    explanation: 'Deadlock prevention breaks at least one Coffman condition.',
  },
  {
    title: 'Virtual Memory, Paging, and Page Fault Handling',
    category: 'Operating Systems',
    difficulty: 'Hard',
    companyTags: ['Google', 'Apple', 'NVIDIA'],
    type: 'conceptual',
    description: 'Explain Virtual Memory mapping using Page Tables, TLB (Translation Lookaside Buffer), and the step-by-step resolution of a Page Fault.',
    sampleAnswer: 'CPU issues a virtual address. TLB is checked first. If TLB miss, Page Table is searched. If valid bit is 0, a Page Fault exception triggers: OS traps error, fetches page from secondary storage into RAM, updates page table, and resumes instruction.',
    explanation: 'Virtual memory isolates processes and allows address space larger than physical RAM.',
  },
  {
    title: 'CPU Scheduling Algorithms Comparison',
    category: 'Operating Systems',
    difficulty: 'Medium',
    companyTags: ['TCS', 'Infosys', 'Dell'],
    type: 'conceptual',
    description: 'Compare FCFS, SJF (Preemptive/Non-preemptive), Round Robin, and Priority CPU scheduling algorithms.',
    sampleAnswer: 'FCFS: Simple but suffers from Convoy Effect. SJF: Optimal average wait time but risks starvation for long processes. Round Robin: Time-sliced preemptive execution optimal for time-sharing systems.',
    explanation: 'Time quantum choice in Round Robin balances context switch overhead against latency.',
  },
  {
    title: 'Semaphores vs Mutex Lock Mechanism',
    category: 'Operating Systems',
    difficulty: 'Medium',
    companyTags: ['Broadcom', 'ARM', 'Oracle'],
    type: 'conceptual',
    description: 'What is the core difference between a Mutex and a Counting Semaphore in process synchronization?',
    sampleAnswer: 'A Mutex is a locking mechanism with ownership semantics (only the thread that locked the mutex can unlock it). A Semaphore is a signaling mechanism using integer counts to restrict access to a finite pool of resources.',
    explanation: 'Semaphores handle multi-resource concurrency without strict thread ownership.',
  },

  // --- COMPUTER NETWORKS ---
  {
    title: 'OSI 7-Layer Model vs TCP/IP Suite',
    category: 'Computer Networks',
    difficulty: 'Easy',
    companyTags: ['Cisco', 'Juniper', 'TCS'],
    type: 'conceptual',
    description: 'List the 7 layers of the OSI model and explain how they map to the 4-layer TCP/IP protocol suite.',
    sampleAnswer: 'OSI Layers: Physical, Data Link, Network, Transport, Session, Presentation, Application. TCP/IP maps Session, Presentation & Application into Application Layer; Transport into Transport Layer; Network into Internet Layer; Physical & Data Link into Network Access Layer.',
    explanation: 'Encapsulation adds protocol headers at each descending layer.',
  },
  {
    title: 'TCP 3-Way Handshake & 4-Way Teardown',
    category: 'Computer Networks',
    difficulty: 'Medium',
    companyTags: ['Cloudflare', 'Google', 'Amazon'],
    type: 'conceptual',
    description: 'Explain SYN, SYN-ACK, ACK packet exchange in TCP 3-Way Handshake and FIN, ACK connection termination.',
    sampleAnswer: 'Handshake: Client sends SYN(seq=x). Server responds with SYN-ACK(seq=y, ack=x+1). Client responds with ACK(ack=y+1). Teardown: Sender sends FIN, Receiver sends ACK. Receiver sends FIN, Sender sends ACK.',
    explanation: 'Handshake synchronizes Sequence Numbers for reliable byte-stream transmission.',
  },
  {
    title: 'HTTP vs HTTPS & SSL/TLS Handshake',
    category: 'Computer Networks',
    difficulty: 'Medium',
    companyTags: ['Meta', 'Microsoft', 'Akamai'],
    type: 'conceptual',
    description: 'Explain how HTTPS secures data over HTTP using SSL/TLS asymmetric and symmetric encryption.',
    sampleAnswer: 'Client initiates connection -> Server sends Digital Certificate & Public Key -> Client validates certificate CA -> Client generates pre-master secret, encrypts with Server Public Key -> Both compute Symmetric Session Key for high-speed encrypted communication.',
    explanation: 'Asymmetric encryption establishes key exchange; symmetric encryption handles session data transfer.',
  },
  {
    title: 'DNS Resolution Process Step-by-Step',
    category: 'Computer Networks',
    difficulty: 'Easy',
    companyTags: ['Amazon', 'Cloudflare', 'Infosys'],
    type: 'conceptual',
    description: 'Trace what happens when a user types www.google.com into a web browser until the IP address is fetched.',
    sampleAnswer: 'Browser Cache -> OS Cache -> Recursive Resolver -> Root DNS Server (.) -> TLD DNS Server (.com) -> Authoritative DNS Server (google.com) returns IP -> Resolver caches result and returns to browser.',
    explanation: 'Hierarchical DNS design reduces lookup latency via multi-tier caching.',
  },
  {
    title: 'TCP vs UDP Protocols Comparison',
    category: 'Computer Networks',
    difficulty: 'Easy',
    companyTags: ['Netflix', 'Twitch', 'Zoom'],
    type: 'conceptual',
    description: 'Compare TCP (Transmission Control Protocol) and UDP (User Datagram Protocol) regarding connection state, reliability, and use cases.',
    sampleAnswer: 'TCP is connection-oriented, reliable (guaranteed order, packet retransmission, flow/congestion control), used for Web, Email, File Transfer. UDP is connectionless, unreliable (low overhead, no order guarantee), used for Live Streaming, Gaming, VoIP.',
    explanation: 'TCP sacrifices speed for reliability; UDP prioritizes real-time performance.',
  },

  // --- OOP (Object Oriented Programming) ---
  {
    title: '4 Pillars of Object-Oriented Programming',
    category: 'OOP',
    difficulty: 'Easy',
    companyTags: ['TCS', 'Infosys', 'Wipro', 'Accenture'],
    type: 'conceptual',
    description: 'Define Encapsulation, Abstraction, Inheritance, and Polymorphism with real-world code analogies.',
    sampleAnswer: 'Encapsulation: Bundling data and methods into a class while hiding internal state (private fields + getters/setters). Abstraction: Hiding implementation details and showing essential features (abstract classes/interfaces). Inheritance: Code reusability where child class inherits parent properties. Polymorphism: Single interface with multiple implementations (Method Overloading & Overriding).',
    explanation: 'OOP concepts structure software systems into modular, maintainable domain entities.',
  },
  {
    title: 'SOLID Design Principles Explained',
    category: 'OOP',
    difficulty: 'Medium',
    companyTags: ['Microsoft', 'Amazon', 'Goldman Sachs'],
    type: 'conceptual',
    description: 'Explain each letter of the SOLID acronym in Object-Oriented Software Design.',
    sampleAnswer: 'S - Single Responsibility Principle (Class has 1 reason to change). O - Open/Closed Principle (Open for extension, closed for modification). L - Liskov Substitution Principle (Derived classes must be substitutable for base classes). I - Interface Segregation Principle (Many specific interfaces over 1 general interface). D - Dependency Inversion Principle (Depend on abstractions, not concretions).',
    explanation: 'SOLID principles eliminate code rigidity and coupling.',
  },
  {
    title: 'Abstract Class vs Interface Comparison',
    category: 'OOP',
    difficulty: 'Easy',
    companyTags: ['Capgemini', 'IBM', 'Cognizant'],
    type: 'conceptual',
    description: 'Compare Abstract Classes and Interfaces in OOP languages regarding fields, multiple inheritance, and method implementations.',
    sampleAnswer: 'Abstract classes can have state (instance fields), constructors, and concrete methods. A class can inherit only 1 abstract class. Interfaces define contract behaviors, support multiple implementation, and contain default/static methods in modern languages.',
    explanation: 'Use Abstract Class for "is-a" relationships with state; use Interface for "can-do" capability contracts.',
  },
  {
    title: 'Method Overloading vs Method Overriding',
    category: 'OOP',
    difficulty: 'Easy',
    companyTags: ['TCS', 'HCL'],
    type: 'conceptual',
    description: 'Compare Compile-time Polymorphism (Overloading) vs Run-time Polymorphism (Overriding).',
    sampleAnswer: 'Overloading occurs within the same class (same method name, different parameter signature) bound at compile-time. Overriding occurs across parent-child class hierarchy (same method signature and return type) resolved at runtime using virtual tables.',
    explanation: 'Dynamic dispatch enables runtime polymorphism.',
  },
  {
    title: 'Composition vs Inheritance',
    category: 'OOP',
    difficulty: 'Medium',
    companyTags: ['Google', 'Meta'],
    type: 'conceptual',
    description: 'Why do modern OOP guidelines recommend "Favor Composition Over Inheritance"?',
    sampleAnswer: 'Inheritance creates tight coupling ("is-a" relationship) and fragile base class problems. Composition ("has-a" relationship) delegates behavior to internal references at runtime, promoting flexible dynamic swapping.',
    explanation: 'Composition avoids deeply nested class inheritance hierarchies.',
  },

  // --- JAVASCRIPT ---
  {
    title: 'JavaScript Event Loop, Call Stack & Microtask Queue',
    category: 'JavaScript',
    difficulty: 'Medium',
    companyTags: ['Meta', 'Uber', 'Netflix'],
    type: 'conceptual',
    description: 'Explain execution order between Call Stack, Web APIs, Macrotask Queue (setTimeout), and Microtask Queue (Promise.then, process.nextTick).',
    sampleAnswer: 'Call stack executes synchronous code first. Asynchronous operations delegate to Web APIs. When completed, Promises enter Microtask Queue and setTimeout enters Macrotask Queue. Event Loop drains the ENTIRE Microtask Queue before processing 1 item from Macrotask Queue.',
    explanation: 'Microtasks have higher priority than macrotasks in JS runtime event loop.',
  },
  {
    title: 'JavaScript Closures & Practical Applications',
    category: 'JavaScript',
    difficulty: 'Medium',
    companyTags: ['Amazon', 'Google', 'Flipkart'],
    type: 'conceptual',
    description: 'What is a closure in JavaScript? Demonstrate how an inner function retains access to outer lexical scope variables.',
    codeTemplate: 'function createCounter() {\n  let count = 0;\n  return function() {\n    return ++count;\n  };\n}',
    sampleAnswer: 'A closure is the combination of a function bundled together with references to its surrounding state (lexical environment). Closures allow data privacy/encapsulation and stateful function creation.',
    explanation: 'Variables in closed-over scope are not garbage collected while inner function references persist.',
  },
  {
    title: 'Debounce vs Throttle Implementation',
    category: 'JavaScript',
    difficulty: 'Hard',
    companyTags: ['Meta', 'Google', 'Swiggy'],
    type: 'coding',
    description: 'Implement a debounce function in vanilla JavaScript for search input optimization.',
    codeTemplate: 'function debounce(fn, delay) {\n  // Write your implementation here\n}',
    sampleAnswer: 'function debounce(fn, delay) {\n  let timer;\n  return function(...args) {\n    clearTimeout(timer);\n    timer = setTimeout(() => fn.apply(this, args), delay);\n  };\n}',
    explanation: 'Debounce delays function execution until after specified quiet time passes.',
  },
  {
    title: 'var vs let vs const & Hoisting Behavior',
    category: 'JavaScript',
    difficulty: 'Easy',
    companyTags: ['TCS', 'Infosys', 'Paytm'],
    type: 'conceptual',
    description: 'Explain scope difference (Function vs Block), Temporal Dead Zone (TDZ), and variable hoisting for var, let, and const.',
    sampleAnswer: 'var is function-scoped and hoisted with `undefined` initialization. let & const are block-scoped `{}` and hoisted into Temporal Dead Zone (accessing before declaration throws ReferenceError). const prevents variable reassignment.',
    explanation: 'Temporal Dead Zone prevents unexpected usage of uninitialized variables.',
  },
  {
    title: 'Prototypal Inheritance in JavaScript',
    category: 'JavaScript',
    difficulty: 'Medium',
    companyTags: ['Microsoft', 'Adobe'],
    type: 'conceptual',
    description: 'How does the prototype chain work when looking up properties on an object in JavaScript?',
    sampleAnswer: 'Every JS object has a hidden `[[Prototype]]` property (accessible via Object.getPrototypeOf). When accessing a property, JS checks the object itself, then traverses up the prototype chain until found or `null` is reached.',
    explanation: 'ES6 `class` syntax is syntactic sugar over prototypal inheritance.',
  },

  // --- REACT ---
  {
    title: 'React Virtual DOM & Reconciliation (Fiber Algorithm)',
    category: 'React',
    difficulty: 'Medium',
    companyTags: ['Meta', 'Netflix', 'Airbnb'],
    type: 'conceptual',
    description: 'How does React Virtual DOM diffing work? Explain how React Fiber prioritizes updates and minimizes real DOM manipulation.',
    sampleAnswer: 'Virtual DOM is a lightweight in-memory JSON representation of real DOM. On state change, React renders a new VDOM tree and diffs it against the old tree using Fiber heuristic algorithm (O(N) complexity using keys). It batches DOM mutations for performance.',
    explanation: 'Keys help React identify moved, added, or deleted list items.',
  },
  {
    title: 'React useEffect Hook Dependencies & Cleanup',
    category: 'React',
    difficulty: 'Easy',
    companyTags: ['Amazon', 'Flipkart', 'Paytm'],
    type: 'conceptual',
    description: 'Explain useEffect lifecycle execution: no dependency array vs empty array `[]` vs state dependencies `[prop]`. Why is a cleanup function returned?',
    sampleAnswer: 'No array runs after every render. Empty array `[]` runs once on mount. `[prop]` runs when specified values change. Cleanup function returned executes before component unmounts or before re-running effect to prevent memory leaks (e.g. clearing intervals, unbinding listeners).',
    explanation: 'Cleanup functions prevent stale closures and memory leaks in SPA components.',
  },
  {
    title: 'React State Management (Context API vs Redux Toolkit)',
    category: 'React',
    difficulty: 'Medium',
    companyTags: ['Meta', 'Uber', 'Zomato'],
    type: 'conceptual',
    description: 'When should you use React Context API vs Redux Toolkit for application state management?',
    sampleAnswer: 'Context API is built-in and ideal for low-frequency global state (e.g., Theme, Auth user profile). Redux Toolkit is suited for complex high-frequency global state, heavy async side-effects, strict state predictability, and devtools time-travel debugging.',
    explanation: 'Context API triggers re-renders on all consuming components when context value object updates.',
  },
  {
    title: 'React Performance Optimization (useMemo, useCallback, React.memo)',
    category: 'React',
    difficulty: 'Medium',
    companyTags: ['Google', 'Microsoft', 'DoorDash'],
    type: 'conceptual',
    description: 'How do React.memo, useMemo, and useCallback prevent unnecessary child component re-renders?',
    sampleAnswer: 'React.memo skips rendering a component if props haven\'t changed (shallow comparison). useMemo memoizes computed expensive calculation results. useCallback memoizes callback function instance references to prevent child re-renders due to prop reference changes.',
    explanation: 'Passing inline functions in props breaks React.memo shallow equality checks without useCallback.',
  },
  {
    title: 'Controlled vs Uncontrolled Components in React',
    category: 'React',
    difficulty: 'Easy',
    companyTags: ['Infosys', 'Capgemini'],
    type: 'conceptual',
    description: 'Compare Controlled Input components (useState binding) vs Uncontrolled Input components (useRef binding).',
    sampleAnswer: 'Controlled components have form data handled directly by React state (`value={state}` + `onChange`). Uncontrolled components store data in DOM directly, accessed using React `useRef()`.',
    explanation: 'Controlled inputs enable instant field validation and conditional button states.',
  },

  // --- HR INTERVIEW QUESTIONS ---
  {
    title: 'Tell Me About Yourself (Elevator Pitch)',
    category: 'HR',
    difficulty: 'Easy',
    companyTags: ['All Companies'],
    type: 'conceptual',
    description: 'Structure a compelling 2-minute response using the Present-Past-Future framework for a software engineering interview.',
    sampleAnswer: 'Present: I am a final-year CS student passionate about full-stack web development... Past: Highlight key project built, technologies used, leadership roles... Future: Explain why this company\'s mission aligns with your career growth objectives.',
    explanation: 'Keep responses concise, relevant to the job role, and focused on value creation.',
  },
  {
    title: 'Describe a Challenging Technical Conflict & How You Resolved It',
    category: 'HR',
    difficulty: 'Medium',
    companyTags: ['Amazon', 'Google', 'Microsoft'],
    type: 'conceptual',
    description: 'Use the STAR technique (Situation, Task, Action, Result) to describe a team technical disagreement.',
    sampleAnswer: 'Situation: Team split on SQL vs NoSQL for project... Task: Needed resolution without delaying milestone... Action: Researched performance benchmarks, presented comparative analysis data to team... Result: Agreed on PostgreSQL, delivered project 3 days ahead of deadline.',
    explanation: 'Demonstrates data-driven decision making and emotional intelligence.',
  },
  {
    title: 'What Are Your Greatest Strengths and Weaknesses?',
    category: 'HR',
    difficulty: 'Easy',
    companyTags: ['TCS', 'Infosys', 'Wipro'],
    type: 'conceptual',
    description: 'How to present a genuine professional weakness alongside an active self-improvement action plan.',
    sampleAnswer: 'Strength: Problem-solving perseverance and rapid adaptation to new frameworks. Weakness: Historically struggled delegating tasks when stressed, but actively using Trello board assignment tracking to improve team trust.',
    explanation: 'Never state "I am a perfectionist" or fake weaknesses. Show authentic self-awareness.',
  },
  {
    title: 'Where Do You See Yourself in 5 Years?',
    category: 'HR',
    difficulty: 'Easy',
    companyTags: ['Accenture', 'Cognizant'],
    type: 'conceptual',
    description: 'Formulate an answer displaying ambition, technical mastery, and long-term organizational commitment.',
    sampleAnswer: 'I see myself evolving into a Senior Full-Stack Engineer / Tech Lead, taking ownership of critical scalable systems, mentoring junior developers, and contributing meaningfully to company product innovation.',
    explanation: 'Focus on growth in skill, responsibility, and impact.',
  },
  {
    title: 'Why Do You Want to Join Our Company?',
    category: 'HR',
    difficulty: 'Easy',
    companyTags: ['All Companies'],
    type: 'conceptual',
    description: 'How to tailor your answer demonstrating research into the company\'s products, tech stack, and engineering culture.',
    sampleAnswer: 'Highlight specific products/engineering blogs of the company, match their tech culture with your learning goals, and articulate how your skills can solve their current scaling or product challenges.',
    explanation: 'Shows genuine motivation rather than generic job seeking.',
  },
];

const { allQuestions } = require('../data/questions');

const slugify = (text) => {
  return String(text || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
};

const seedDatabase = async (options = {}) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/prepai';
      console.log(`[Seed Service] Connecting to MongoDB...`);
      await mongoose.connect(mongoURI);
    }

    // 1. Ensure default Admin user exists
    let adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
      adminUser = await User.create({
        name: 'PrepAI Admin',
        email: 'admin@prepai.com',
        password: 'AdminPassword123!',
        role: 'admin',
        profile: {
          bio: 'Platform Lead & Content Curator',
        },
      });
      console.log('[Seed Service] Created default Admin User: admin@prepai.com');
    }

    // 2. Non-destructive migration: Assign slug to any existing MongoDB questions missing one
    const existingWithoutSlug = await Question.find({
      $or: [{ slug: { $exists: false } }, { slug: null }, { slug: '' }],
    });

    if (existingWithoutSlug.length > 0) {
      console.log(`[Seed Service] Migrating ${existingWithoutSlug.length} existing database questions with stable slugs...`);
      for (const eq of existingWithoutSlug) {
        let baseSlug = `${slugify(eq.category)}-${slugify(eq.title)}`;
        // Check if slug collision exists
        const exists = await Question.findOne({ slug: baseSlug, _id: { $ne: eq._id } });
        if (exists) {
          baseSlug = `${baseSlug}-${eq._id.toString().slice(-4)}`;
        }
        eq.slug = baseSlug;
        await eq.save();
      }
      console.log('[Seed Service] Existing questions migrated successfully.');
    }

    // 3. Aggregate seed data (questionsData + modular questions), deduplicated by slug
    const combinedQuestionsMap = new Map();

    // Add legacy seed data with normalized slugs
    questionsData.forEach((q) => {
      const slug = q.slug || `${slugify(q.category)}-${slugify(q.title)}`;
      combinedQuestionsMap.set(slug, { ...q, slug });
    });

    // Add modular validated questions (higher precedence)
    allQuestions.forEach((q) => {
      combinedQuestionsMap.set(q.slug, q);
    });

    const uniqueQuestionsToSeed = Array.from(combinedQuestionsMap.values());
    console.log(`[Seed Service] Performing non-destructive, idempotent upsert for ${uniqueQuestionsToSeed.length} questions...`);

    // 4. Idempotent bulk upsert (preserves existing documents and user progress)
    const bulkOps = uniqueQuestionsToSeed.map((q) => ({
      updateOne: {
        filter: { slug: q.slug },
        update: {
          $set: {
            ...q,
            createdBy: adminUser._id,
          },
          $setOnInsert: {
            createdAt: new Date(),
          },
        },
        upsert: true,
      },
    }));

    const result = await Question.bulkWrite(bulkOps);

    console.log('====================================================');
    console.log(`[Seed Success] Idempotent sync completed!`);
    console.log(`Inserted (new): ${result.upsertedCount}`);
    console.log(`Updated (existing): ${result.modifiedCount}`);
    console.log(`Matched (unchanged): ${result.matchedCount}`);

    // Report current total and per-category breakdown in database
    const totalInDB = await Question.countDocuments();
    const categoriesInDB = await Question.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    console.log(`Total questions in database: ${totalInDB}`);
    console.log('Category distribution in MongoDB:');
    const displayTable = {};
    categoriesInDB.forEach((c) => {
      displayTable[c._id] = c.count;
    });
    console.table(displayTable);
    console.log('====================================================');

    if (!options.skipDisconnect && require.main === module) {
      await mongoose.disconnect();
      process.exit(0);
    }

    return {
      success: true,
      totalInDB,
      upsertedCount: result.upsertedCount,
      modifiedCount: result.modifiedCount,
    };
  } catch (error) {
    console.error(`[Seed Error] ${error.message}`);
    if (require.main === module) {
      process.exit(1);
    }
    throw error;
  }
};

if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;

