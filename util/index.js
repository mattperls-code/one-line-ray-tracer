document.getElementById("input").addEventListener("input", () => {
    let input = document.getElementById("input").value

    input = input.replaceAll(" ", "")
    input = input.replaceAll("\n", "")
    input = input.replaceAll("leti", "let i")
    input = input.replaceAll("letj", "let j")

    navigator.clipboard.writeText(input)
})