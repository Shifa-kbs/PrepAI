const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Question = require('./models/Question');

dotenv.config({ path: __dirname + '/.env' });

const seedQuestions = [
  {
    title: 'Two Sum Optimal Complexity',
    category: 'DSA',
    difficulty: 'Easy',
    companyTags: ['Amazon', 'Google', 'Meta'],
    description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. What is the optimal time and space complexity using a Hash Map?',
    options: [
      'O(N^2) Time, O(1) Space',
      'O(N log N) Time, O(1) Space',
      'O(N) Time, O(N) Space',
      'O(1) Time, O(N) Space',
    ],
    correctAnswerIndex: 2,
    sampleAnswer: 'O(N) time and O(N) space using a single pass with Hash Map complement lookup.',
    explanation: 'By iterating through the array once and looking up the complement (target - nums[i]) in a Hash Map, each lookup is O(1) on average. This achieves optimal O(N) linear time with O(N) auxiliary space.',
    type: 'mcq',
  },
  {
    title: 'LRU Cache Eviction Policy Data Structure',
    category: 'DSA',
    difficulty: 'Medium',
    companyTags: ['Amazon', 'Microsoft', 'Uber'],
    description: 'Which combination of data structures is optimal to implement an LRU (Least Recently Used) cache with O(1) get and put operations?',
    options: [
      'Doubly Linked List + Hash Map',
      'Singly Linked List + Binary Search Tree',
      'Max Heap + Hash Map',
      'Array + Stack',
    ],
    correctAnswerIndex: 0,
    sampleAnswer: 'Doubly Linked List combined with a Hash Map allows O(1) node removal/insertion and O(1) key lookups.',
    explanation: 'A Hash Map provides O(1) key-to-node lookup. A Doubly Linked List allows O(1) node removal and repositioning to the head/tail upon access or eviction.',
    type: 'mcq',
  },
  {
    title: 'Trapping Rain Water Algorithm',
    category: 'DSA',
    difficulty: 'Hard',
    companyTags: ['Google', 'Meta', 'Goldman Sachs'],
    description: 'Given n non-negative integers representing an elevation map where the width of each bar is 1, what is the most optimal space complexity to compute trapped water in O(N) time?',
    options: [
      'O(N) Space using prefix max arrays',
      'O(1) Auxiliary Space using two-pointer approach',
      'O(log N) Space using divide and conquer',
      'O(N^2) Space using dynamic programming table',
    ],
    correctAnswerIndex: 1,
    sampleAnswer: 'O(1) auxiliary space using two pointers (left and right) with running leftMax and rightMax trackers.',
    explanation: 'Using two pointers moving from ends towards the center while tracking leftMax and rightMax allows computing water volume trapped at each step with O(1) auxiliary memory.',
    type: 'mcq',
  },
  {
    title: 'Java String Immutability and Memory Pool',
    category: 'Java',
    difficulty: 'Easy',
    companyTags: ['Infosys', 'TCS', 'Oracle'],
    description: 'Why are String objects immutable in Java, and where are string literals stored in memory?',
    options: [
      'For security, synchronization, and caching in the String Constant Pool (Heap)',
      'Because primitive types cannot be modified in the Stack',
      'To prevent garbage collection overhead in Metaspace',
      'String is mutable in Java 17+',
    ],
    correctAnswerIndex: 0,
    sampleAnswer: 'Strings are immutable for security, thread safety, and String Constant Pool optimization in the Heap.',
    explanation: 'String immutability ensures safety across multi-threaded applications, parameter integrity in network connections/classloaders, and enables the JVM String Pool to save memory.',
    type: 'mcq',
  },
  {
    title: 'Java ConcurrentHashMap Concurrency Mechanism',
    category: 'Java',
    difficulty: 'Medium',
    companyTags: ['Goldman Sachs', 'Morgan Stanley', 'JPMorgan'],
    description: 'In Java 8+, how does ConcurrentHashMap achieve thread safety without locking the entire map?',
    options: [
      'Locks the entire table using ReentrantReadWriteLock',
      'Synchronizes only on the head node of a hash bucket and uses CAS (Compare-And-Swap) operations',
      'Uses ThreadLocal copies for each accessing thread',
      'Delegates to Collections.synchronizedMap wrapper',
    ],
    correctAnswerIndex: 1,
    sampleAnswer: 'Java 8 ConcurrentHashMap uses CAS for empty bucket insertion and synchronizes on the first bucket node for collisions.',
    explanation: 'Java 8 replaced segment locking with lock-free CAS operations for inserting new nodes and synchronized blocks locking only the specific bucket head during collisions or treeification.',
    type: 'mcq',
  },
  {
    title: 'Python GIL (Global Interpreter Lock) Behavior',
    category: 'Python',
    difficulty: 'Medium',
    companyTags: ['Netflix', 'Meta', 'Dropbox'],
    description: 'What is the impact of CPython\'s Global Interpreter Lock (GIL) on multi-threaded programs?',
    options: [
      'It prevents multiple native OS threads from running CPU-bound Python bytecode simultaneously',
      'It disables asynchronous I/O operations in asyncio',
      'It restricts Python scripts to a single core even when using multiprocessing',
      'It automatically synchronizes access to all user variables without mutexes',
    ],
    correctAnswerIndex: 0,
    sampleAnswer: 'The GIL allows only one thread to execute Python bytecode at a time, limiting CPU-bound speedup across multi-core systems.',
    explanation: 'In CPython, the GIL is a mutex that protects Python objects from concurrent corruption. For CPU-bound tasks, multithreading does not scale across multiple cores; multiprocessing or C-extensions are required.',
    type: 'mcq',
  },
  {
    title: 'SQL Index B-Tree vs Hash Index',
    category: 'SQL',
    difficulty: 'Medium',
    companyTags: ['Uber', 'Amazon', 'Flipkart'],
    description: 'Why are B+ Tree indexes predominantly chosen over Hash indexes for relational database columns?',
    options: [
      'B+ Trees require zero disk memory compared to Hash tables',
      'B+ Trees efficiently support range queries (BETWEEN, <, >), sorting (ORDER BY), and prefix matching',
      'Hash indexes cannot handle integer primary keys',
      'B+ Trees operate in O(1) guaranteed time for all queries',
    ],
    correctAnswerIndex: 1,
    sampleAnswer: 'B+ Tree leaf nodes form a linked list enabling efficient range scanning and ordered traversals.',
    explanation: 'While Hash indexes offer O(1) equality lookups, they cannot execute range scans, inequality filters, or prefix searches. B+ Tree leaf nodes are sorted and linked, making range queries and sorting fast.',
    type: 'mcq',
  },
  {
    title: 'Database Normalization: BCNF vs 3NF',
    category: 'DBMS',
    difficulty: 'Hard',
    companyTags: ['Oracle', 'Microsoft', 'Atlassian'],
    description: 'What is the key difference between 3rd Normal Form (3NF) and Boyce-Codd Normal Form (BCNF)?',
    options: [
      'BCNF permits multi-valued dependencies whereas 3NF eliminates them',
      'In BCNF, for every functional dependency X -> Y, X must be a superkey, with no exception for prime attributes',
      '3NF requires all columns to be foreign keys',
      'BCNF always preserves functional dependencies whereas 3NF does not',
    ],
    correctAnswerIndex: 1,
    sampleAnswer: 'BCNF strictly requires the determinant X in every FD X -> Y to be a superkey, eliminating non-trivial dependencies on prime attributes allowed in 3NF.',
    explanation: '3NF allows X -> A if A is a prime attribute (part of any candidate key). BCNF removes this relaxation and requires X to strictly be a superkey for every non-trivial dependency.',
    type: 'mcq',
  },
  {
    title: 'Operating System Virtual Memory Page Fault',
    category: 'Operating Systems',
    difficulty: 'Medium',
    companyTags: ['Intel', 'Cisco', 'Google'],
    description: 'When does a Page Fault hardware trap occur in an Operating System?',
    options: [
      'When a thread tries to write to read-only register memory',
      'When a process accesses a virtual memory page that is not currently loaded into physical RAM',
      'When CPU cache L1 experiences a cache miss',
      'When the OS scheduler runs out of process control blocks (PCBs)',
    ],
    correctAnswerIndex: 1,
    sampleAnswer: 'A page fault occurs when a referenced virtual page has its valid bit unset in the page table, indicating it is not resident in physical RAM.',
    explanation: 'The MMU triggers a page fault exception when the accessed virtual address maps to an entry not present in RAM. The OS loads the page from secondary storage (swap/disk) into a physical frame.',
    type: 'mcq',
  },
  {
    title: 'TCP Three-Way Handshake Process',
    category: 'Computer Networks',
    difficulty: 'Easy',
    companyTags: ['Cisco', 'Cloudflare', 'Amazon'],
    description: 'What is the correct sequence of packets exchanged between client and server to establish a TCP connection?',
    options: [
      'SYN -> SYN-ACK -> ACK',
      'ACK -> SYN -> SYN-ACK',
      'HELLO -> SYN -> ACK',
      'FIN -> ACK -> FIN-ACK',
    ],
    correctAnswerIndex: 0,
    sampleAnswer: 'Client sends SYN, server responds with SYN-ACK, client replies with ACK.',
    explanation: 'TCP uses SYN, SYN-ACK, ACK to synchronize sequence numbers and establish a reliable, full-duplex transmission channel between host and server.',
    type: 'mcq',
  },
  {
    title: 'OOP SOLID Principles - Liskov Substitution',
    category: 'OOP',
    difficulty: 'Medium',
    companyTags: ['Microsoft', 'Adobe', 'Capgemini'],
    description: 'What does the Liskov Substitution Principle (LSP) state regarding object-oriented inheritance?',
    options: [
      'A class should have only one reason to change',
      'Subtypes must be substitutable for their base types without altering the correctness of the program',
      'Depend on abstractions rather than concrete implementations',
      'Clients should not be forced to depend upon interfaces they do not use',
    ],
    correctAnswerIndex: 1,
    sampleAnswer: 'Derived classes must preserve the behavioral contracts of their parent classes without throwing unexpected exceptions or violating assumptions.',
    explanation: 'LSP guarantees that any client code using a reference to a base class can seamlessly use any derived class instance without knowing the difference or encountering bugs.',
    type: 'mcq',
  },
  {
    title: 'JavaScript Event Loop & Microtask Queue',
    category: 'JavaScript',
    difficulty: 'Medium',
    companyTags: ['Meta', 'Netflix', 'Swiggy'],
    description: 'In what order are Promises (.then callbacks) and setTimeout callbacks executed in the JavaScript Event Loop when both are queued?',
    options: [
      'setTimeout callbacks (macrotasks) run before Promise callbacks (microtasks)',
      'Promise callbacks (microtasks) execute immediately after the synchronous stack empties before any macrotasks',
      'They execute alternately in round-robin fashion',
      'It depends entirely on the browser vendor',
    ],
    correctAnswerIndex: 1,
    sampleAnswer: 'Microtask queue (Promise callbacks, queueMicrotask) is drained completely before the event loop picks the next macrotask (setTimeout).',
    explanation: 'JavaScript processes the microtask queue to completion right after the current execution context completes and before rendering or executing the next macrotask from the task queue.',
    type: 'mcq',
  },
  {
    title: 'React useEffect Hook Dependencies & Stale Closures',
    category: 'React',
    difficulty: 'Medium',
    companyTags: ['Airbnb', 'Meta', 'Swiggy'],
    description: 'What causes a "stale closure" bug inside a React useEffect or useCallback hook?',
    options: [
      'Using React.memo on components with props',
      'Referencing state or props inside the effect callback without declaring them in the dependency array',
      'Mutating state directly through ref.current',
      'Calling hooks inside conditional blocks',
    ],
    correctAnswerIndex: 1,
    sampleAnswer: 'Capturing variables in an effect closure created during an earlier render when dependencies are omitted from the dependency array.',
    explanation: 'When an effect function references state or props but omits them from its dependency array, the callback maintains references to the variables from the render in which it was instantiated, reading obsolete values.',
    type: 'mcq',
  },
  {
    title: 'HR Behavioral: STAR Method Application',
    category: 'HR',
    difficulty: 'Easy',
    companyTags: ['Amazon', 'Google', 'Accenture'],
    description: 'What do the letters in the STAR interview technique stand for?',
    options: [
      'Strategy, Tactics, Action, Review',
      'Situation, Task, Action, Result',
      'Strength, Talent, Ambition, Resilience',
      'Scope, Target, Achievement, Return',
    ],
    correctAnswerIndex: 1,
    sampleAnswer: 'STAR stands for Situation, Task, Action, and Result.',
    explanation: 'The STAR framework structures behavioral interview responses by outlining the context (Situation), your responsibility (Task), the specific steps you took (Action), and the measurable outcome (Result).',
    type: 'mcq',
  },
];

async function seed() {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/prepai';
    console.log(`[Seed Script] Connecting to MongoDB at ${mongoURI}...`);
    await mongoose.connect(mongoURI);

    const count = await Question.countDocuments();
    console.log(`Current questions in database: ${count}`);

    const force = process.argv.includes('--force');

    if (count > 0 && !force) {
      console.log('✅ Database already has questions. Skipping seed. (Use --force to insert seed questions)');
      process.exit(0);
    }

    console.log(`Seeding ${seedQuestions.length} curated questions...`);
    await Question.insertMany(seedQuestions);
    console.log('✅ Successfully seeded questions!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    process.exit(1);
  }
}

seed();
