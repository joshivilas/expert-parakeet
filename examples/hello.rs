// Sample Rust file for testing Rust Quick Run extension
// Press Ctrl+Shift+R to run, F5 to debug, Ctrl+Shift+B to build

fn main() {
    println!("Hello from Rust Quick Run!");

    // Test some basic Rust features
    let numbers = vec![1, 2, 3, 4, 5];
    let sum: i32 = numbers.iter().sum();

    println!("Sum of {:?} = {}", numbers, sum);

    // Test a function
    let result = fibonacci(10);
    println!("Fibonacci(10) = {}", result);

    // Test user input (uncomment to test)
    // test_input();
}

fn fibonacci(n: u32) -> u64 {
    match n {
        0 => 0,
        1 => 1,
        _ => fibonacci(n - 1) + fibonacci(n - 2),
    }
}

#[allow(dead_code)]
fn test_input() {
    use std::io::{self, Write};

    print!("Enter your name: ");
    io::stdout().flush().unwrap();

    let mut name = String::new();
    io::stdin().read_line(&mut name).unwrap();

    println!("Hello, {}!", name.trim());
}
