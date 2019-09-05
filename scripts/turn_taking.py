import sys


def take_turn(message: str) -> bool:
    """
    :param message: 사용자가 입력한 말
    :return: 사용자의 말을 가로챌지(turn-taking) 판단한 결과
    """
    return len(message) < 5

if __name__ == "__main__":
    print(take_turn(sys.argv[1]))
