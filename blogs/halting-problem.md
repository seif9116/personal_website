## The Halting Problem...

Test blog...

Just kidding, I can not solve the halting problem.

In fact, my career is baking on it.



```c++
class A {
public:
    A(int value) : value() ;

    A(const A& other);
    A& operator=(const A& other);
    
    A(A&& other) noexcept; 
    A& operator=(A&& other) noexcept;

private:
    int data;
};

```

